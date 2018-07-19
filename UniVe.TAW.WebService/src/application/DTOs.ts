import * as enums from "../infrastructure/identity";

export interface ISignupRequestDto {
    Username: string;
    Password: string;
    BirthDate: Date;
    CountryId: enums.Country
}

export interface IUserDto {
    Id: string;
    Username: string;
    Age: number;
    CountryId: enums.Country
}

export interface ILoginCredentials {
    Username: string;
    Password: string;
}

export interface IUserJWTData {
    Id: string;
    Username: string;
}

// export interface IMatchCreationRequestDto {
//     constructor(
//          PlayerId: string;
//     }
// }

export interface IPendingMatchDto {
    Id: string;
    PlayerId: string;
}

export interface IMatchDto {
    Id: string;
    FirstPlayerId: string;
    SecondPlayerId: string;
    CreationDateTime: Date;
}