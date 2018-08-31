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
    Settings: game.IMatchSettings;
}

export interface IPlayingMatchDto {
    Id: string;
    Enemy: IUserDto;
    Settings: game.IMatchSettings;
}

export interface IJoinableMatchDto {
    Id: string;
    Creator: IUserDto;
}

//export type IBattleFieldSettingsDto = Partial<game.BattleFieldSettings>;

export interface IShipTypeAvailabilityDto extends game.ShipTypeAvailability { };

// export interface IMatchSettingsDto {
//     BattleFieldWidth: number;
//     BattleFieldHeight: number;
//     ShipTypeAvailabilities: ReadonlyArray<IShipTypeAvailabilityDto>; // Partial<game.ShipTypeAvailability>[];
//     MinShipDistance: number;
// }

export interface IPlayablesDto {
    CanCreateMatch: boolean;
    PendingMatchId: string;
    PlayingMatch: IPlayingMatchDto;
    JoinableMatches: ReadonlyArray<IJoinableMatchDto>;
}

export interface IMatchReadyEventDto {
    MatchId: string;
}

// export interface IMatchInfoDto extends IMatchDto {
//     Settings: IMatchSettingsDto;
// }