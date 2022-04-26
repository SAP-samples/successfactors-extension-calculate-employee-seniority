using {sap.capire.senioritycalc as my} from '../db/schema';
using {PhotoUser as photo} from './external/PhotoUser.csn';

service EmployeeService @(_requires : 'authenticated-user') {
    entity Employee as projection on my.Employee;

    event EmployeeEvent {
        userId            : String;
        hireDate          : String;
        terminationDate   : String;
        originalStartDate : String;
        status            : String;
    }
    
    @cds.persistence.skip
    entity Photo as projection on photo.Photo {
        key userId, key photoType, photo
    }
   
    @cds.persistence.skip
    entity EmpEmployment as projection on photo.EmpEmployment {
        key userId, lastDateWorked, seniorityDate, userNav
    }

    @cds.persistence.skip
    entity User as projection on photo.User {
        key userId, defaultFullName
    }

    view EmployeeProfile as
        select from photo.Photo,
        photo.EmpEmployment
        mixin {
            employee : Association to Employee
                           on Photo.userId = $projection.userId
        }
        into {
            key employee.ID                           as ID,
                employee.userId                       as userId,
                employee.hireDate                     as hireDate,
                employee.originalStartDate            as originalStartDate,
                employee.status                       as status,
                employee.terminationDate              as terminationDate,
                Photo.photo                           as photo,
                EmpEmployment.userNav.defaultFullName as defaultFullName,
                EmpEmployment.lastDateWorked          as lastTerminationDate : Timestamp,
                EmpEmployment.seniorityDate           as seniorityDate       : Timestamp
        };
}