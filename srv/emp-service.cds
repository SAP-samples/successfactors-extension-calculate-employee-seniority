using {sap.capire.senioritycalc as my} from '../db/schema';
using {PhotoUser as photo} from './external/PhotoUser.csn';

service EmployeeService @(_requires : 'authenticated-user') {
    entity Employee           as projection on my.Employee;

    event EmployeeEvent {
        userId            : String;
        hireDate          : String;
        terminationDate   : String;
        originalStartDate : String;
        status            : String;
    }
    
    @cds.persistence.skip
    entity Photo              as projection on photo.Photo {
        key userId, key photoType, photo, userNav.defaultFullName
    }

    @cds.persistence.skip
    entity User               as projection on photo.User {
        key userId, defaultFullName as fullName
    }

    @cds.persistence.skip
    entity EmpEmployment               as projection on photo.EmpEmployment {
        key userId, key personIdExternal, lastDateWorked, seniorityDate
    }

    view ProfileMixin as
        select from photo.Photo,
        photo.User,
        photo.EmpEmployment
        mixin {
            employee : Association to Employee
                           on Photo.userId = $projection.userId;
        }
        into {
            key employee.ID,
                Photo.userId,
                photo,
                employee.hireDate,
                employee.originalStartDate,
                employee.status,
                employee.terminationDate,
                User.defaultFullName as fullName,
                EmpEmployment.lastDateWorked as lastTerminationDate : Timestamp,
                EmpEmployment.seniorityDate : Timestamp
        };
}