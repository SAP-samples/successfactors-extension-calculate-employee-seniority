module.exports = async (srv) => {
  const sfsfSrv = await cds.connect.to("sfsf");
  const messaging = await cds.connect.to("messaging");
  const pUser = await cds.connect.to("PhotoUser");

  const { Employee, Photo, User, EmpEmployment } = srv.entities;

  srv.after("UPDATE", "Employee", async (res) => {
    if (!res.userId) { return res; } 
    let employee = await SELECT.one
          .from(Employee)
          .where({ userId: res.userId, status: { like: "REH%" } })
          .orderBy("createdAt desc");
    console.log(employee);
    let id = employee.userId;
    console.log("Exception Resolved");
    let status = employee.status;
    if (status) {
      let {
        years,
        months,
        days,
        totalDays,
      } = await calcSeniorityTotalDaysException(employee);
      if (employee.status === "EXCEPTION") {
        return res;
      }
      let payload = getSeniorityPayload(id, years, months, days, totalDays);
      let response = await sfsfSrv.post("/upsert", payload);
      console.log(response);
    }
  });

  srv.on("READ", "ProfileMixin", async (req) => {
    let userList = await srv.run(
      SELECT.from(Employee)
        .columns(
          "ID",
          "userId",
          "hireDate",
          "terminationDate",
          "originalStartDate",
          "status"
        )
        .where({
          status: "EXCEPTION",
        })
    );
    let userVals = userList.reduce(
      (acc, curVal) => acc.concat(curVal.userId),
      []
    );

    let photoList = await pUser.run(
      SELECT.from(Photo).columns("userId", "photo").where({
        userId: userVals,
        photoType: 27
      })
    );

    let nameList = await pUser.run(
      SELECT.from(User).columns("userId", "defaultFullName").where({
        userId: userVals
      })
    );

    let lastDateWorkedList = await pUser.run(
      SELECT.from(EmpEmployment)
        .columns("userId", "lastDateWorked", "seniorityDate")
        .where({
          userId: userVals
        })
    );

    userList.forEach((emp) => {
      let pic = photoList.find((photo) => emp.userId === photo.userId);
      let date = lastDateWorkedList.find((user) => emp.userId === user.userId);
      let name = nameList.find((user) => emp.userId === user.userId);

      pic && pic["photo"] ? (emp.photo = pic["photo"]) : (emp.photo = "");

      name && name["defaultFullName"]
        ? (emp.fullName = name["defaultFullName"])
        : (emp.fullName = "");

      if (date["lastDateWorked"]) {
        let lastDateWorked = new Date(date["lastDateWorked"]);
        lastDateWorked.setUTCDate(lastDateWorked.getDate() + 1);
        emp.lastTerminationDate = lastDateWorked;
      } else {
        emp.lastTerminationDate = "";
      }

      if (date["seniorityDate"]) {
        let seniorityDate = new Date(date["seniorityDate"]);
        emp.seniorityDate = seniorityDate;
      } else {
        emp.seniorityDate = "";
      }
    });

    if (req.params && req.params[0]) {
      userList = userList.filter(
        (user) => user.ID === `${req.params[0]}`
      );
    }
    return userList;
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
    } else if (status.includes("REH", 0)) {
      let history = await srv.run(
        SELECT.one
          .from(Employee)
          .where({ userId: employee.userId, status: { like: "%TER%" } })
          .orderBy("terminationDate desc")
      );
      // add exception status
      history === null ? (employee.status = "EXCEPTION") : employee.status;
      console.log("EXCEPTION caught: " + employee.status);
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
    console.log("Insert");
    console.log(employee);
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
        totalDays: diffInDays
      };
    }
  };
};
