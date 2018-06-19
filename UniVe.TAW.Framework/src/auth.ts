// export function alertBla() {
//     alert("bla");
//     console.log("bla");
// }

import * as auth_infr from './infrastructure/auth';

export interface IUser {
    Username: string,
    BirthDate: Date,
    CountryId: auth_infr.Country,
    Roles: auth_infr.UserRoles,
}