[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/successfactors-extension-calculate-employee-seniority)](https://api.reuse.software/info/github.com/SAP-samples/successfactors-extension-calculate-employee-seniority)

# Create a custom mobile app to extend HR capabilities
## Description
Create a custom mobile app for employees that extends HR functions and helps enable a mobile workforce. Leverage low-code technologies to quickly design and deploy the app to any device and provide business users with a seamless and frictionless experience, wherever they are. This is especially important for desk-less workers that want key functionality in a ready to use tool, tailored to their daily functions.

**Current Position - What is the challenge?**
Customers often want to expand the user experience of their core business systems for key functions such as finance, procurement, and human resources. They want to unify common staff functions and content into a simple, intuitive mobile application to maintain employee productivity and engagement.

**Destination - What is the outcome?**
Provide employees with timely, contextual information right from their mobile device to help them become more self-sufficient and improve productivity. Empower a mobile workforce to fulfill customer requests from anywhere.

**How You Get There - What is the solution?**
The application notifies staff about key updates using notifications and leverages real-time data from SAP SuccessFactors and the SAP BTP to ensure relevant information for mobile workers. It enables HR business partners to update employee information on the fly, with a simple, curated experience.

### Solution Diagram

![solution diagram](images/Create%20a%20custom%20mobile%20app%20to%20extend%20HR%20capabilities%20-%20Solution%20Diagram.png)

The Calculate Employee Seniority extension is developed using the SAP Cloud Application programming Model (CAP) and runs on the SAP BTP, Cloud Foundry runtime. It consumes platform services like SAP Event Mesh, SAP HANA Cloud and the Destination service. The events occuring in SAP SuccessFactors are inserted into the SAP Event Mesh queue. The application running in Cloud Foundry is notified on events, consumes them from the queue and inserts the event data into the HANA Cloud database, applies rules for seniority calculation and finally updates those results to custom fields on SAP SuccessFactors.

In this addition to the use case, SAP AppGyver is added to quickly created a native mobile application for exception handling. There are enhancements to the CAP service, incorporating remote SAP SuccessFactors services, and the ability to handle CORS communication between SAP AppGyver and SAP SuccessFactors OData services. This has the increased benefit of proxying specific entities from the SFSF backend on-demand, reducing data duplication of sensitive HR information. 

## Prerequisites
The required systems and components are:

- SAP SuccessFactors (SFSF)
- SAP BTP enterprise or trial account

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
| SAP AppGyver                      | standard         |


## Setup & Configuration

### Pre-requisites: [Configure the Calculate Employee Seniority use case](https://github.com/SAP-samples/successfactors-extension-calculate-employee-seniority/tree/mission)

### Step 1: [Set up AppGyver on SAP BTP using a booster](../mission-sfsf-mobile-appgyver/01-SetupSAPBusinessTechnologyPlatform)
### Step 2: [Clone the GitHub repository and adapt the configuration to your environment](../mission-sfsf-mobile-appgyver/02-CloneTheGitHubRepositoryAndAdaptTheConfigurationToYourEnvironment)
### Step 3: [Deploy CAP Application to Cloud Foundry and HANA Cloud](../mission-sfsf-mobile-appgyver/03-DeployCAPApplicationToCloudFoundryAndHANACloud)
### Step 4: [Create an SAP AppGyver project ](../mission-sfsf-mobile-appgyver/04-CreateSAPAppGyverProject)
### Step 5: [Connect SAP AppGyver to the backend via OData](../mission-sfsf-mobile-appgyver/05-ConnectSAPAppGyverToTheBackendViaOData)
### Step 6: [Modeling logic with SAP AppGyver no-code features ](../mission-sfsf-mobile-appgyver/06-ModelingLogicWithSAPAppGyverNoCodeFeatures)
### Step 7: [Test end to end from SAP AppGyver to SAP SuccessFactors](../mission-sfsf-mobile-appgyver/07-TestEndToEndFromSAPAppGyverToSAPSuccessFactors)
### Step 8: [Customize the application and services for your own scenario](../mission-sfsf-mobile-appgyver/08-CustomizeTheApplicationAndServicesForYourOwnScenario)


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
