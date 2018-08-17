import * as enums from "../infrastructure/identity";
import * as game from "../infrastructure/game";

export interface ISignupRequestDto {
    Username: string;
    Password: string;
    BirthDate: Date;
    CountryId: enums.Country;
}

export interface IUserDto {
    Id: string;
    Username: string;
    Age: number;
    CountryId: enums.Country;
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
    //CreationDateTime: Date;
}

export interface IMatchDto {
    Id: string;
    FirstPlayerId: string;
    SecondPlayerId: string;
    CreationDateTime: Date;
    Settings: game.MatchSettings;
}

export interface IJoinableMatchDto {
    Id: string;
    Creator: IUserDto;
}

//export type IBattleFieldSettingsDto = Partial<game.BattleFieldSettings>;

export interface IMatchSettingsDto {
    BattleFieldSettings: game.BattleFieldSettings; // IBattleFieldSettingsDto;
    ShipTypeAvailability: game.ShipTypeAvailability[]; // Partial<game.ShipTypeAvailability>[];
    MinShipDistance: number;
}

// export interface IMatchInfoDto extends IMatchDto {
//     Settings: IMatchSettingsDto;
// }