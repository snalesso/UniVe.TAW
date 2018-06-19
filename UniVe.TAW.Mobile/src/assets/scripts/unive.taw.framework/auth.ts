// export function alertBla() {
//     alert("bla");
//     console.log("bla");
// }

import * as auth_infr from './infrastructure/auth';

export interface IUser {
    Username: string,
    //mail: string,
    Roles: auth_infr.UserRoles,
    CountryId: auth_infr.Country,
}

export class SignupRequestDto {

    public constructor(
        public readonly Username: string,
        public readonly Password: string,
        public readonly BirthDate: Date,
        public readonly CountryId: auth_infr.Country) {
    }
}

export class UserDto {

    public constructor(
        public readonly Id: string,
        public readonly Username: string,
        public readonly Age: number,
        //public readonly Roles: UserRoles,
        public readonly CountryId: auth_infr.Country) { }
}