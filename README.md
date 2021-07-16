[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/successfactors-extension-calculate-employee-seniority)](https://api.reuse.software/info/github.com/SAP-samples/successfactors-extension-calculate-employee-seniority)

# Calculate Employee Seniority with event-driven extensions
## Description
Calculate Employee Seniority is an extension to SAP SuccessFactors to manage complex seniority scenarios that impact Human Resources, Employee Benefits, and Employee Payroll. This solution can apply appropriate rules to a wide variety of Human Resources actions, including: 1. Employee Hire 2. Employment Termination 3. Employee Rehire These seniority rules can impact employee pension plans, employee savings plans such as (USA) 401k employer contributions/matches, and other programs. It's also possible to retrieve employee history from the same extension. This automatic calculation frees up HR specialists from having to maintain eligibility dates manually. Different industries can leverage this use case where seniority calculations are needed. Some organizations have very complex rules that govern employee eligibility for 401k and other benefits. This process is currently manual and error-prone for HR staff members and potentially causing legal challenges to the enterprise. These rules are often due to collective bargaining agreements, and the rules and regulations can be both demanding and inflexible. They may also require precise calculations triggered by breaks in employment service, employee rehires dates, employee leaves of absence, etc. This extension provides organizations with a flexible tool to manage such complex scenarios. Rather than rely on human record-keeping and reporting, this solution can automatically apply rules to determine seniority. This solution will reduce the workload on the HR team as well as improve accuracy.

**Current Position - What is the challenge?**
Some organizations have very complex rules that govern employee eligibility for 401k / employee saving plan match and other benefits. This process is currently manual and error-prone for HR staff members and potentially causing legal challenges to the enterprise.

These rules are often due to collective bargaining agreements, and the rules and regulations can be demanding & inflexible.

Rules may include precise calculations triggered by employee broken service, employee rehires dates etc.

**Destination - What is the outcome?**
This automatic calculation frees up HR specialists from having to maintain eligibility dates manually. Different industries can leverage this use case where seniority calculations are needed.

**How You Get There - What is the solution?**
Calculate Employee Seniority uses SAP SuccessFactors Intelligent Service Center, together with the SAP BTP, to adjust the employee's seniority date based upon events and calculations, and store the history.
This application provides HR with custom functionality to calculate seniority dates without manual intervention. The Calculate Employee Seniority Rules are integrated with an SAP Extension suite extension for historical data to access an employee's history for specific calculations.

### Solution Diagram

![solution diagram](../mission/images/solution_diagram.png) 

The Calculate Employee Seniority extension is developed using the SAP Cloud Application programming Model (CAP) and runs on the SAP BTP, Cloud Foundry runtime. It consumes platform services like SAP Event Mesh, SAP HANA Cloud and the Destination service. The events occuring in SAP SuccessFactors are inserted into the SAP Event Mesh queue. The application running in Cloud Foundry is notified on events, consumes them from the queue and inserts the event data into the HANA Cloud database, applies rules for seniority calculation and finally updates those results to custom fields on SAP SuccessFactors.

## Prerequisites
The required systems and components are:

- SAP SuccessFactors (SFSF)
- SAP BTP account

Entitlements/Quota required in your SAP Business Technology Platform Account:

| Service                           | Plan        | Number of instances |
| --------------------------------- | ----------- | ------------------- |
| Cloud Foundry runtime             | MEMORY      | 1                   |
| SAP Event Mesh                    | default     | 1                   |
| Authorization & Trust Management  | application | 1                   |
| Destination                       | lite        | 1                   |
| SAP HANA Schemas & HDI Containers | hdi-shared  | 1                   |
| SAP HANA Cloud                    | hana        | 1                   |
| SAP SuccessFactors Extensibility  | api-access  | 1                   |

Subscriptions required in your SAP Business Technology Platform Account:

| Subscription                      | Plan             |
| --------------------------------- | ---------------- |
| SAP Business Application Studio   | standard         |
| SAP Event Mesh                    | standard         |

## Setup & Configuration

### Step 1: [Setup SAP Business Technology Platform](../mission/01-SetupSAPBusinessTechnologyPlatform)
### Step 2: [Setup SAP BTP and SAP SuccessFactors connectivity and extensibility](../mission/02-SetupSAPBTPAndSAPSuccessFactorsConnectivityAndExtensibility)
### Step 3: [Configure SAP Business Application Studio](../mission/03-ConfigureSAPBusinessApplicationStudio)
### Step 4: [Clone the GitHub repository and adapt the configuration to your environment](../mission/04-CloneTheGitHubRepositoryAndAdaptTheConfigurationToYourEnvironment)
### Step 5: [Deploy CAP Application to Cloud Foundry and HANA Cloud](../mission/05-DeployCAPApplicationToCloudFoundryAndHANACloud)
### Step 6: [Configure Events on SAP SuccessFactors](../mission/06-ConfigureEventsOnSAPSuccessFactors)
### Step 7: [Configure custom seniority fields in SAP SuccessFactors](../mission/07-ConfigureCustomSeniorityFieldsInSAPSuccessFactors)
### Step 8: [Test End to End from SAP SuccessFactors to CAP Application](../mission/08-TestEndToEndFromSAPSuccessFactorsToCAPApplication)
### Step 9: [Run CAP Application in SAP Business Application Studio](../mission/09-RunCAPApplicationInSAPBusinessApplicationStudio)
### Step 10: [Customize Seniority Rules to your own requirements](../mission/10-CustomizeSeniorityRulesToYourOwnRequirements)

## Requirements

  * A BTP global account or [trial account](https://www.sap.com/products/business-technology-platform/trial.html)
  * An SAP SuccessFactors tenant (optional)

## Download and Installation

Start the mission with Step 1 above

## Known Issues

No known issues at this time

## How to obtain support

[Create an issue](https://github.com/SAP-samples/successfactors-extension-calculate-employee-seniority/issues) in this repository if you find a bug or have questions about the content.
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## Contributing

If you would like to contribute, please submit a pull request in the usual fashion.

## License
Copyright (c) 2021 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSES/Apache-2.0.txt) file.
