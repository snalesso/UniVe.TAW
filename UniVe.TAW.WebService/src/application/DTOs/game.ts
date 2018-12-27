import * as game from "../../infrastructure/game";
import * as game_client from "../../infrastructure/game.client";
import * as identityDTOs from "./identity";

export interface IJoinableMatchDto {
    Id: string;
    Creator: identityDTOs.IUserDto;
}

export interface IPendingMatchDto {
    Id: string;
    PlayerId: string;
}

// export interface IMatchConfigResultDto {
//     readonly IsConfigured: boolean;
//     readonly MatchStartDateTime: Date;
// }

export interface IMatchDto {
    Id: string;

    Settings: game.IMatchSettings;

    //CreationDateTime: Date;
    StartDateTime: Date;
    EndDateTime: Date;

    CanFire: boolean;
    DidIWin: boolean;

    OwnSide: {
        IsConfigured: boolean;
        Cells: game_client.IOwnBattleFieldCell[][];
    };
    EnemySide: {
        Player: identityDTOs.ISimpleUserDto;
        Cells: game_client.EnemyBattleFieldCellStatus[][];
    };
}

export interface IShipTypeAvailabilityDto extends game.ShipTypeAvailability { };

export interface IPlayablesDto {
    CanCreateMatch: boolean;
    PendingMatchId: string;
    PlayingMatchId: string;
    JoinableMatches: ReadonlyArray<IJoinableMatchDto>;
}

/** When both players joined but someone didn't config his fleet yet **/
export interface IPendingMatchJoinedEventDto {
    readonly MatchId: string;
    readonly PendingMatchId: string;
}

export interface IMatchEventDto {
}

/** When both players joined the match and both configured their fleet */
export interface IMatchStartedEventDto extends IMatchEventDto {
    readonly InActionPlayerId: string;
    readonly StartDateTime: Date;
}

export interface IMatchEndedEventDto extends IMatchEventDto {
    readonly EndDateTime: Date;
    readonly WinnerId: string;
    readonly IsResigned: boolean;
}

export interface IYouGotShotEventDto extends IMatchEventDto {
    readonly OwnFieldCellChanges: ReadonlyArray<game_client.IOwnBattleFieldCell>;
    readonly IsOwnTurn: boolean;
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