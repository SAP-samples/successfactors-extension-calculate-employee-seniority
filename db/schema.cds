using { managed, sap } from '@sap/cds/common';
namespace sap.capire.senioritycalc;

entity Employee : managed {
    key ID : UUID;
    userId : String(64);
    hireDate : Date;
    terminationDate : Date;
    originalStartDate: Date;
    status : String(1024);
    seniority: DecimalFloat;
}
