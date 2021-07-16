# Customize CAP Application in SAP Business Application Studio

## Introduction
The given rules for calculating the seniority are not satisfying for everyone. Therefore you can easily change the rules how the seniority is calculated by reimplementing a few lines of code.

1. Check the code for the [Initial Seniority Rules](https://github.com/SAP-samples/successfactors-extension-calculate-employee-seniority/blob/main/srv/emp-service.js#L32-L57):

```javascript
let hireDate = new Date(employee.hireDate)
let terminationDate = new Date(employee.terminationDate)
let originalStartDate = new Date(employee.originalStartDate)
let diffInMs = null;

if (status.includes("HIR", 0)) {
    minuendDate = Date.now()
    diffInMs = Date.now() - hireDate;
}
else if (status.includes("TER", 0)) {
     diffInMs = Math.abs(terminationDate - originalStartDate);
} 
else if (status.includes("RE", 0)) {
     let history = await srv.run(SELECT.one.from(Employee).where({ userId: employee.userId, status: { like: '%TER%' } }).orderBy('terminationDate', 'desc'));
     if (history != null && history.terminationDate != null) {
         terminationDate = new Date(history.terminationDate)
         diffInMs = Math.abs(hireDate - terminationDate);
         diffInMs = diffInMs > 180 * (1000 * 60 * 60 * 24) ? Date.now() - hireDate : Math.abs(terminationDate - originalStartDate) + Math.abs(Date.now() - hireDate);
     }
}

let diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
let years = Math.floor(diffInDays / 365.25);
let months = Math.floor(diffInDays % 365.25 / 30);
let days = Math.floor(diffInDays % 365.25 % 30);

employee.seniority = diffInDays
```

2. Change the logic to calculate the ```employee.seniority``` to your requirements
3. [Run CAP Application in SAP Business Application Studio](../09-RunCAPApplicationInSAPBusinessApplicationStudio) and [Test End to End from SAP SuccessFactors to CAP Application](../08-TestEndToEndFromSAPSuccessFactorsToCAPApplication) like in the previous steps
4. [Redeploy CAP Application to Cloud Foundry and HANA Cloud](../05-DeployCAPApplicationToCloudFoundryAndHANACloud#redeployment) with respect to the hint of redeployment
