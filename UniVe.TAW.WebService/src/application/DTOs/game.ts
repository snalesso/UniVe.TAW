import * as game from "../../infrastructure/game";
import * as game_client from "../../infrastructure/game.client";
import * as identityDTOs from "./identity";

export interface IJoinableMatchDto {
    Id: string;
    Creator: identityDTOs.IUserDto; // TODO: add winratio
}

export interface IPlayablesDto {
    CanCreateMatch: boolean;
    PendingMatchId: string;
    PlayingMatchId: string;
    JoinableMatches: ReadonlyArray<IJoinableMatchDto>;
}

// export interface IMatchConfigResultDto {
//     readonly IsConfigured: boolean;
//     readonly MatchStartDateTime: Date;
// }

export interface IMatchOwnSideDto {
    IsConfigured: boolean;
    Cells: game_client.IOwnBattleFieldCell[][];
}

export interface IMatchEnemySideDto {
    Player: identityDTOs.ISimpleUserDto;
    Cells: game_client.IEnemyBattleFieldCell[][];
}

export interface IMatchDto {
    Id: string;

    Settings: game.IMatchSettings;

    //CreationDateTime: Date;
    StartDateTime: Date;
    EndDateTime: Date;

    CanFire: boolean;
    DidIWin: boolean;

    OwnSide: IMatchOwnSideDto;
    EnemySide: IMatchEnemySideDto;
}

export interface IShipTypeAvailabilityDto extends game.ShipTypeAvailability { };

/** When both players joined but someone didn't config his fleet yet **/
export interface IPendingMatchJoinedEventDto {
    readonly MatchId: string;
    readonly PendingMatchId: string;
}

export interface IMatchEventDto {
}

/** When both players joined the match and both configured their fleet */
export interface IMatchStartedEventDto extends IMatchEventDto {
    readonly StartDateTime: Date;
    readonly CanFire: boolean;
    readonly OwnCells: game_client.IOwnBattleFieldCell[][];
    readonly EnemyCells: game_client.IEnemyBattleFieldCell[][];
}

export interface IYouGotShotEventDto extends IMatchEventDto {
    readonly OwnFieldCellChanges: ReadonlyArray<game_client.IOwnBattleFieldCell>;
    readonly CanFire: boolean;
    readonly MatchEndDateTime: Date;
    readonly DidILose: boolean;
}

export interface IAttackResultDto {
    readonly EnemyFieldCellChanges: ReadonlyArray<game_client.IEnemyBattleFieldCell>;
    readonly CanFireAgain: boolean;
    readonly MatchEndDateTime: Date;
    readonly DidWin: boolean;
}

export interface IEndedMatchDto {
    readonly Id: string;
    readonly FirstPlayerSide: IEndedMatchPlayerSideDto;
    readonly SecondPlayerId: IEndedMatchPlayerSideDto;
    readonly Winner: identityDTOs.ISimpleUserDto;
}

export interface IEndedMatchPlayerSideDto {
    readonly PlayerId: string;
    readonly FieldCells: ReadonlyArray<game_client.IOwnBattleFieldCell>;
}

export interface IEndedMatchSummaryDto {
    readonly Id: string;
    readonly EndDateTime: Date;
    readonly FirstPlayer: identityDTOs.ISimpleUserDto;
    readonly SecondPlayer: identityDTOs.ISimpleUserDto;
    readonly WinnerId: string;
}