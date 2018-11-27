import * as enums from "../infrastructure/identity";
import * as game from "../infrastructure/game";
import * as game_client from "../infrastructure/game.client";
import * as identity from "../infrastructure/identity";
//import * as chat from "../infrastructure/chat";

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
    BannedUntil: Date;
    Roles: enums.UserRoles;
}

export interface ISimpleUserDto {
    Id: string;
    Username: string;
}

export interface ILoginCredentials {
    Username: string;
    Password: string;
}

export interface IUserJWTData {
    Id: string;
    Username: string;
    BannedUtil: Date;
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

export interface IOwnSideMatchStatus {
    EnemyId: string;
    IsConfigNeeded: boolean;
    IsMatchStarted: boolean;
    //IsMatchEnded: boolean; // TODO: remove, EndDateTime is enough, same for start
    EndDateTime: Date;
    DidIWin: boolean;
}

export interface IOwnSideMatchConfigStatus {
    IsConfigNeeded: boolean;
    Settings: game.IMatchSettings;
}

export interface IPlayersTurnInfoDto {
    MatchId: string;
    MatchSettings: game.IMatchSettings;
    MatchEndedDateTime: Date;
    OwnsMove: boolean;
}

export interface IOwnTurnInfoDto extends IPlayersTurnInfoDto {
    Enemy: IUserDto;
    EnemyField: ReadonlyArray<ReadonlyArray<game_client.EnemyBattleFieldCellStatus>>;
    //IsOwnTurn: boolean;
}

export interface IEnemyTurnInfoDto extends IPlayersTurnInfoDto {
    OwnField: ReadonlyArray<ReadonlyArray<game_client.IOwnBattleFieldCell>>;
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

export interface IMatchEventDto {
    readonly MatchId: string;
}

/** When both players joined but someone didn't config his fleet yet **/
export interface IMatchReadyEventDto extends IMatchEventDto {
}

/** When both players joined the match and both configured their fleet */
export interface IMatchStartedEventDto extends IMatchEventDto {
    //readonly StartDateTime: Date;
    readonly InActionPlayerId: string;
}

export interface IMatchEndedEventDto extends IMatchEventDto {
    readonly EndDateTime: Date;
    readonly WinnerId: string;
    readonly IsResigned: boolean;
}

export interface IAttackResultDto {
    readonly NewEnemyField: ReadonlyArray<ReadonlyArray<game_client.EnemyBattleFieldCellStatus>>;
    readonly EnemyFieldCellChanges: ReadonlyArray<game_client.IEnemyBattleFieldCell>;
    readonly StillOwnsMove: boolean;
    //readonly IsMatchEnded: boolean;
}

export interface INewMessage {
    readonly Text: string;
    //readonly SenderId: string;
    readonly AddresseeId: string;
}

// export interface DeliveredMessage extends INewMessage {
//     readonly Timestamp: Date;
// }

export interface IChatHistoryMessageDto {
    readonly IsMine: boolean;
    readonly Text: string;
    readonly Timestamp: Date;
}

export interface IChatHistoryHeaderDto {
    readonly Interlocutor: ISimpleUserDto;
    readonly LastMessage: IChatHistoryMessageDto;
}

export interface IYouGotShotEventDto {
    readonly OwnFieldCellChanges: ReadonlyArray<game_client.IOwnBattleFieldCell>;
}

// export interface IMatchInfoDto extends IMatchDto {
//     Settings: IMatchSettingsDto;
// }

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
    readonly Roles: enums.UserRoles;
    readonly CanTemporarilyBan: boolean;
    readonly CanPermaBan: boolean;
    readonly CanPromote: boolean;
    readonly CanPlay: boolean;
    readonly CanChat: boolean;
}

export interface IEndedMatchDto {
    readonly Id: string;
    readonly FirstPlayerSide: IEndedMatchPlayerSideDto;
    readonly SecondPlayerId: IEndedMatchPlayerSideDto;
    readonly Winner: ISimpleUserDto;
}

export interface IEndedMatchPlayerSideDto {
    readonly PlayerId: string;
    readonly FieldCells: ReadonlyArray<game_client.IOwnBattleFieldCell>;
}

export interface IEndedMatchSummaryDto {
    readonly Id: string;
    readonly EndDateTime: Date;
    readonly FirstPlayer: ISimpleUserDto;
    readonly SecondPlayer: ISimpleUserDto;
    readonly WinnerId: string;
}