import * as enums from "../domain/enums/user";

export class SignupRequestDto {

    public constructor(
        public readonly Username: string,
        public readonly Password: string,
        public readonly BirthDate: Date,
        public readonly CountryId: enums.Country) {
    }
}

export class UserDto {

    public constructor(
        public readonly Id: string,
        public readonly Username: string,
        public readonly Age: number,
        public readonly CountryId: enums.Country) {
    }
}

export class LoginCredentials {

    public constructor(
        public readonly Username: string,
        public readonly Password: string) {
        // if (!Username || Username.length <= 0)
        //     throw new Error("Username cannot be null");
        // if (!Password || Password.length <= 0)
        //     throw new Error("Password cannot be null");
    }
}

export class UserJWTData {

    public constructor(
        public readonly Id: string,
        public readonly Username: string) {
    }
}