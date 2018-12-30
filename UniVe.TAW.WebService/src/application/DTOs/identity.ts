import * as identity from "../../infrastructure/identity";

export interface ISignupRequestDto {
    Username: string;
    Password: string;
    BirthDate: Date;
    CountryId: identity.Country;
}

export interface IUserDto {
    Id: string;
    Username: string;
    Age: number;
    CountryId: identity.Country;
    BannedUntil: Date;
    Role: identity.UserRole;
}

export interface ISimpleUserDto {
    Id: string;
    Username: string;
}

export interface ILoginCredentials {
    Username: string;
    Password: string;
}

export interface IUserJWTPayload {
    Id: string;
    Username: string;
    BannedUtil: Date;
}

export interface IUserProfile extends IUserDto {
    WinsCount: number;
    LossesCount: number;
}

export interface IUserRanking {
    Id: string;
    Username: string;
    WinsCount: number;
    LossesCount: number;
    WinRatio: number;
}

export interface IUserBanRequest {
    UserId: string;
    BanDurationHours: number;
}

export interface IUserPowers {
    readonly Role: identity.UserRole;
    readonly CanTemporarilyBan: boolean;
    readonly CanPermaBan: boolean;
    readonly CanAssignRoles: boolean;
    readonly CanDeleteUser: boolean;
}

/** Cannot POST only the new role value */
export interface IRoleAssignmentRequestDto {
    readonly NewRole: identity.UserRole;
}