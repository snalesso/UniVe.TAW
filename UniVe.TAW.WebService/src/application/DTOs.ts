import * as enums from "../infrastructure/identity";
import * as game from "../infrastructure/game";
import * as game_client from "../infrastructure/game.client";

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

export interface IOwnMatchSideConfigStatus {
    IsConfigNeeded: boolean;
    Settings: game.IMatchSettings;
}

export interface IMatchSnapshotDto {
    Id: string;
    Settings: game.IMatchSettings;
    IsConfigNeeded: boolean;
    OwnField: ReadonlyArray<game_client.IOwnBattleFieldCell>;
    Enemy: IUserDto;
    EnemyField: ReadonlyArray<game_client.IEnemyBattleFieldCell>;
    IsOwnTurn: boolean;
    IsEnemyTurn: boolean;
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
    PlayingMatch: IMatchSnapshotDto;
    JoinableMatches: ReadonlyArray<IJoinableMatchDto>;
}

export interface IMatchReadyEventDto {
    MatchId: string;
}

// export interface IMatchInfoDto extends IMatchDto {
//     Settings: IMatchSettingsDto;
// }