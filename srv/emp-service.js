module.exports = async (srv) => {
    const sfsfSrv = await cds.connect.to("sfsf");
    const messaging = await cds.connect.to("messaging");
    const pUser = await cds.connect.to("PhotoUser");
  
    const { Employee } = srv.entities;
  
    srv.on("READ", "EmpEmployment", async (req) => {
      return await pUser.run(req.query);
    });
  
    srv.on("READ", "Photo", async (req) => {
      const { columns, limit, where } = req.query.SELECT;
      let combinedPred;
      where
        ? (combinedPred = where.concat(
            "and",
            cds.parse.expr(`photoType = 27`)["xpr"]
          ))
        : (combinedPred = cds.parse.expr(`photoType = 27`)["xpr"]);
      return await pUser.read("Photo", columns).limit(limit).where(combinedPred);
    });
  
    srv.on("READ", "EmployeeProfile", async (req) => {
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
          let photo = await pUser.run(
            SELECT.one
              .from("Photo")
              .columns("photo")
              .where({ userId: user.userId, photoType: 27 })
          );
          photo ? (user.photo = photo.photo) : (user.photo = "");
          let profile = await pUser.run(
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
        let payload = getSeniorityPayload(id, years, months, days, totalDays);
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
        let payload = getSeniorityPayload(id, years, months, days, totalDays);
        let response = await sfsfSrv.post("/upsert", payload);
        console.log(response);
      }
    );
  
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
        let history = await srv.run(
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
  
    const getSeniorityPayload = (userId, years, months, days, totalDays) => {
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