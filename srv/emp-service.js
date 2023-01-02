module.exports = async (srv) => {
  const sfsfSrv = await cds.connect.to("sfsf");
  const messaging = await cds.connect.to("messaging");
  const pUser = await cds.connect.to("PhotoUser");
  const xsenv = require('@sap/xsenv');
  const rp = require('request-promise');
  const dest_service = xsenv.getServices({ dest: { tag: 'destination' } }).dest;
  const uaa_service = xsenv.getServices({ uaa: { tag: 'xsuaa' } }).uaa;
  const sUaaCredentials = dest_service.clientid + ':' + dest_service.clientsecret;
  const { Employee } = srv.entities;

  const getdestinationDetails = async (destination) => {
    let tokenData = await rp({
      uri: uaa_service.url + '/oauth/token',
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(sUaaCredentials).toString('base64'),
        'Content-type': 'application/x-www-form-urlencoded'
      },
      form: {
        'client_id': dest_service.clientid,
        'grant_type': 'client_credentials'
      }
    })
    const token = JSON.parse(tokenData).access_token;
    let destinationData = await rp({
      uri: dest_service.uri + '/destination-configuration/v1/destinations/' + destination,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const oDestination = JSON.parse(destinationData);
    console.log(oDestination.destinationConfiguration.hasOwnProperty("audience"))
    if (oDestination.destinationConfiguration.hasOwnProperty("audience") && oDestination.destinationConfiguration.audience.toString().includes("successfactors")) {
      return true;
    }
    else { return false; }

  };

  

  srv.on("READ", "EmpEmployment", async (req) => {
    let issfsf = await getdestinationDetails(sfsfSrv.destination);
    if (issfsf) { return await pUser.run(req.query); }
    else return await sfsfSrv.run(req.query);
  });

  srv.on("READ", "Photo", async (req) => {
    let issfsf = await getdestinationDetails(sfsfSrv.destination);
    const { columns, limit, where, from, orderBy } = req.query.SELECT;
    let combinedPred;
    where
      ? (combinedPred = where.concat(
        "and",
        cds.parse.expr(`photoType = 27`)["xpr"]
      ))
      : (combinedPred = cds.parse.expr(`photoType = 27`)["xpr"]);
    if (issfsf) { return await pUser.read("Photo", columns).limit(limit).where(combinedPred); }
    else return await sfsfSrv.run({
      SELECT: {
        from: from,
        where: combinedPred,
        limit: limit,
        columns: columns,
        orderBy: orderBy
      }
    });

  });

  srv.on("READ", "EmployeeProfile", async (req) => {
    let issfsf = await getdestinationDetails(sfsfSrv.destination);
    let userList = await srv
      .run(
        SELECT.from("Employee", (emp) => {
          emp.ID,
            emp.userId,
            emp.hireDate,
            emp.terminationDate,
            emp.originalStartDate,
            emp.status;
        }).where({
          status: "EXCEPTION",
        })
      )
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return err;
      });

    if (Array.isArray(userList) && userList.length === 0) {
      return [{}];
    }

    if (req.params && req.params[0]) {
      userList = userList.filter((user) => user.ID === `${req.params[0]}`);
    }

    await Promise.all(
      userList.map(async (user) => {
        let photo = await sfsfSrv.run(
          {
            SELECT: {
              from: {
                ref: [
                  {
                    id: 'EmployeeService.Photo',
                    columns: 'photo',
                    where: [
                      { ref: ['userId'] },
                      '=',
                      { val: user.userId },
                      'and',
                      { ref: ['photoType'] },
                      '=',
                      { val: 27 }
                    ]
                  }
                ]
              },
              one: true
            }
          }
        );
        photo ? (user.photo = photo.photo) : (user.photo = "");
        console.log(issfsf);
        let profile = issfsf ? await pUserEmpEmployment(user) : await mockEmpEmployment(user);
        let lastDateWorked;
        if (profile && profile.lastDateWorked) {
          lastDateWorked = new Date(profile.lastDateWorked);
          lastDateWorked.setUTCDate(lastDateWorked.getDate() + 1);
        }
        profile && profile.lastDateWorked
          ? (user.lastTerminationDate = lastDateWorked)
          : (user.lastTerminationDate = "");
        profile && profile.seniorityDate
          ? (user.seniorityDate = new Date(profile.seniorityDate))
          : (user.seniorityDate = "");
        profile && profile.userNav.defaultFullName
          ? (user.defaultFullName = profile.userNav.defaultFullName)
          : (user.defaultFullName = "");
        return user;
      })
    );

    return userList;
  });

  srv.after("UPDATE", async (res) => {
    if (!res.userId) {
      return res;
    }
    let employee = await SELECT.one
      .from(Employee)
      .where({ userId: res.userId, status: { like: "REH%" } })
      .orderBy("createdAt desc");
    console.log("employee =>");
    console.log(employee.userId);
    let id = employee.userId;
    console.log("Exception Resolved");
    let status = employee.status;
    if (status) {
      let { years, months, days, totalDays } =
        await calcSeniorityTotalDaysException(employee);
      if (status === "EXCEPTION") {
        return res;
      }
      let payload = await getSeniorityPayload(id, years, months, days, totalDays);
      console.log("PAYLOAD");
      let response = await sfsfSrv.post("/upsert", payload);
      console.log("Response => ");
      console.log(response);
    }
  });

  messaging.on(
    "sap/successfactors/SFPART057671/isc/contractchange",
    async (msg) => {
      console.log("<< create event caught");

      let employee = msg.data;
      console.log(msg);
      let id = employee.userId;

      let { years, months, days, totalDays } = await calcSeniorityTotalDays(
        employee
      );
      if (employee.status === "EXCEPTION") {
        return;
      }
      let payload = await getSeniorityPayload(id, years, months, days, totalDays);
      let response = await sfsfSrv.post("/upsert", payload);
      console.log(response);
    }
  );

  const pUserEmpEmployment = async (user) => {
    return await pUser.run(
      SELECT.one
        .from("EmpEmployment", (emp) => {
          emp.userId,
            emp.lastDateWorked,
            emp.seniorityDate,
            emp.userNav.defaultFullName,
            emp.userNav((user) => {
              user;
            });
        })
        .where({ userId: user.userId })
    );
  }

  const mockEmpEmployment = async (user) => {
    return await sfsfSrv.run({
      SELECT: {
        from: {
          ref: [
            {
              id: 'EmployeeService.EmpEmployment',
              where: [
                { ref: ['userId'] },
                '=',
                { val: user.userId },
                'and',
                { ref: ['personIdExternal'] },
                '=',
                { val: user.userId }
              ]
            }
          ]
        },
        one: true
      }
    });
  }

  const calcSeniorityTotalDays = async (employee) => {
    const status = employee.status;
    Object.keys(employee).forEach((key) => {
      if (employee[key] === "") {
        employee[key] = null;
      }
    });

    // START SENIORITY RULES

    let hireDate = new Date(employee.hireDate);
    let terminationDate = new Date(employee.terminationDate);
    let originalStartDate = new Date(employee.originalStartDate);
    let diffInMs = null;

    if (status.includes("HIR", 0)) {
      diffInMs = Date.now() - hireDate;
    } else if (status.includes("TER", 0)) {
      diffInMs = Math.abs(terminationDate - originalStartDate);
    } else if (status.includes("RE", 0)) {
      let history = await cds.run(
        SELECT.one
          .from(Employee)
          .where({ userId: employee.userId, status: { like: "%TER%" } })
          .orderBy("terminationDate desc")
      );
      // add exception status
      history === null ? (employee.status = "EXCEPTION") : employee.status;
      if (history != null && history.terminationDate != null) {
        terminationDate = new Date(history.terminationDate);
        diffInMs = Math.abs(hireDate - terminationDate);
        diffInMs =
          diffInMs > 180 * (1000 * 60 * 60 * 24)
            ? Date.now() - hireDate
            : Math.abs(terminationDate - originalStartDate) +
            Math.abs(Date.now() - hireDate);
      }
    }

    let diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
    let years = Math.floor(diffInDays / 365.25);
    let months = Math.floor((diffInDays % 365.25) / 30);
    let days = Math.floor((diffInDays % 365.25) % 30);

    // END SENIORITY RULES
    employee.seniority = diffInDays;
    srv.run(INSERT.into(Employee).entries(employee));

    return { years: years, months: months, days: days, totalDays: diffInDays };
  };

  const getSeniorityPayload = async (userId, years, months, days, totalDays) => {
    let issfsf = await getdestinationDetails(sfsfSrv.destination);
    if(issfsf){
      return {
        __metadata: {
          uri: `https://apisalesdemo4.successfactors.com:443/odata/v2/EmpEmployment(personIdExternal='${userId}',userId='${userId}')`,
          type: "SFOData.EmpEmployment",
        },
        customString1: years.toString(),
        customString2: months.toString(),
        customString3: days.toString(),
        customString4: totalDays.toString(),
      };
    }
    else{
      return {
        userId:userId,
        customString1: years.toString(),
        customString2: months.toString(),
        customString3: days.toString(),
        customString4: totalDays.toString(),
      };
    }
    
  };

  const calcSeniorityTotalDaysException = async (employee) => {
    const status = employee.status;
    if (status) {
      Object.keys(employee).forEach((key) => {
        if (employee[key] === "") {
          employee[key] = null;
        }
      });

      // START SENIORITY RULES

      let hireDate = new Date(employee.hireDate);
      let terminationDate = new Date(employee.terminationDate);
      let originalStartDate = new Date(employee.originalStartDate);
      let diffInMs = null;

      if (status.includes("RE", 0)) {
        diffInMs = Math.abs(hireDate - terminationDate);
        diffInMs =
          diffInMs > 180 * (1000 * 60 * 60 * 24)
            ? Date.now() - hireDate
            : Math.abs(terminationDate - originalStartDate) +
            Math.abs(Date.now() - hireDate);
      }

      let diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
      let years = Math.floor(diffInDays / 365.25);
      let months = Math.floor((diffInDays % 365.25) / 30);
      let days = Math.floor((diffInDays % 365.25) % 30);

      // END SENIORITY RULES
      employee.seniority = diffInDays;
      srv.run(UPDATE(Employee, employee.ID).with({ seniority: diffInDays }));

      return {
        years: years,
        months: months,
        days: days,
        totalDays: diffInDays,
      };
    }
  };
};
