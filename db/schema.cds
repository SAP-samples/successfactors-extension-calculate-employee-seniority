using { managed, sap } from '@sap/cds/common';
namespace sap.capire.senioritycalc;

entity Employee : managed {
    key ID : UUID @odata.Type:'Edm.String';
    userId : String(64);
    hireDate : Timestamp;
    originalStartDate: Timestamp;
    status : String(1024);
    seniority: DecimalFloat;
    terminationDate: Timestamp;
}