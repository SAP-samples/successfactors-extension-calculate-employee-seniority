# Customize CAP Application in SAP Business Application Studio

## Introduction
The given rules for calculating the seniority are not satisfying for everyone. Therefore you can easily change the rules how the seniority is calculated by reimplement a few lines of code.

1. Check the code for the [Initial Seniority Rules](https://github.tools.sap/btp-use-case-factory/successfactors-seniority-calculator/blob/main/bas/seniority-calc-cds/srv/emp-service.js#L32-L57):

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
    diffInMs = Math.abs(terminationDate - originalStartDate) + Math.abs(Date.now() - hireDate);
} 
else if (status.includes("RE", 0)) {
    let history = await srv.run(SELECT.one.from(Employee).where({ userId: employee.userId, status: { like: '%TER%' } }).orderBy('terminationDate', 'desc'));
    diffInMs = Math.abs(hireDate - history.terminationDate);
    diffInMs = diffInMs > 180 * (1000 * 60 * 60 * 24) ? 0 : Math.abs(terminationDate - originalStartDate) + Math.abs(Date.now() - hireDate);
}

let diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
let years = Math.floor(diffInDays / 365.25);
let months = Math.floor(diffInDays % 365.25 / 30);
let days = Math.floor(diffInDays % 365.25 % 30);

employee.seniority = diffInDays
```

2. Change the logic to calculate the ```employee.seniority``` to your requirements
3. [Run CAP Application in SAP Business Application Studio](../10-RunCAPApplicationInSAPBusinessApplicationStudio) and [Test End to End from SAP SuccessFactors to CAP Application](../09-TestEndToEndFromSAPSuccessFactorsToCAPApplication) like in the previous steps
4. [Redeploy CAP Application to Cloud Foundry and HANA Cloud](../06-DeployCAPApplicationToCloudFoundryAndHANACloud#redeployment) with respect to the hint of redeployment
