# Setup SAP BTP and SAP SuccessFactors connectivity and extensibility

To connect to a SAP SuccessFactors system we first have to register it on the SAP BTP global account.

1. Create a new SAP SuccessFactors System
    * Go to your SAP BTP Global Account and select Systems
    * Click on Register System
    * Set a system Name - we will need this name in later section.
    * Select SAP SuccessFactors as type
    * Click on Register

   ![BTP](./images/btp-1.png)

2. In the Register System pop-up copy the generated token to a local file and close the window. The status of the SAP SuccessFactors system is now pending.

   ![Register SFSF System](./images/btp-2.png)

3. Go to your SAP SuccessFactors Provisioning Tool Home Page. Select your company.

   ![Register SFSF System](./images/sf-1.png)

4. In the Edit Company Settings click on Extension Management Configuration

   ![Register SFSF System](./images/sf-2.png)

5. In the Add New Integration section insert the token from your SAP Business Technology Platform account and click on add

   ![Register SFSF System](./images/sf-3.png)

6. At your SAP Business Technology Platform account the system should now have the status "Registered"

   ![Register SFSF System](./images/btp-4.png)