using {sap.capire.senioritycalc as my} from '../db/schema';

service EmployeeService @(requires : 'authenticated-user') {
    entity Employee as projection on my.Employee;

    event EmployeeEvent {
        userId: String;
        hireDate: String;
        terminationDate: String;
        originalStartDate: String;
        status: String;
    }
}
