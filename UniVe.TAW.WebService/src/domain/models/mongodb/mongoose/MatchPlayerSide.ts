import * as mongoose from 'mongoose';

import * as Constants from './Constants';
import * as Coord from './Coord';
import * as ShipPlacement from './ShipPlacement';
import * as ServerSideBattleFieldCell from './ServerSideBattleFieldCell';
//import * as BattleFieldSettings from './BattleFieldSettings';
import * as MatchSettings from './MatchSettings';

import * as game from '../../../../infrastructure/game';
import * as game_server from '../../../../infrastructure/game.server';
import * as game_client from '../../../../infrastructure/game.client';

// TODO: split validators into many single validators each with its own error message

export interface IMongooseMatchPlayerSide extends mongoose.Document {
    readonly PlayerId: mongoose.Types.ObjectId,
    //FleetConfig: ReadonlyArray<ShipPlacement.IMongooseShipPlacement>,
    BattleFieldCells: ServerSideBattleFieldCell.IMongooseServerSideBattleFieldCell[][], //ReadonlyArray<ReadonlyArray<ServerSideBattleFieldCell.IMongooseServerSideBattleFieldCell>>,
    // TODO: does it work if IMongooseX interfaces' methods take in pure TS classes?
    configFleet: (matchSettings: MatchSettings.IMongooseMatchSettings, shipPlacements: ShipPlacement.IMongooseShipPlacement[]) => boolean,
    // getOwnerView: () => game_client.ClientSideBattleFieldCell_Owner[][],
    // getEnemyView: () => game_client.ClientSideBattleFieldCell_Enemy[][],
    receiveFire: (coord: Coord.IMongooseCoord) => boolean // returns true if something has been hit, false if water, exception if it was already hit
}

const matchPlayerSideSchema = new mongoose.Schema(
    {
        PlayerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Constants.ModelsNames.User,
            required: true
        },
        // FleetConfig: {
        //     type: [ShipPlacement.getSchema()],
        //     // validate: {
        //     //     validator: function validator(this: IMongooseMatchPlayerSide, value: ShipPlacement.IMongooseShipPlacement[]) {
        //     //         return (this.FleetConfig == null // fleetconfig cannot be changed once set
        //     //             && this.BattleFieldCells == null)
        //     //             || (value != null // fleet config cannot be null
        //     //                 && value.length > 0); // fleet config cannot be empty
        //     //     }
        //     // }
        // },
        BattleFieldCells: {
            type: [[ServerSideBattleFieldCell.getSchema()]],
            default: null,
            // validate: {
            //     validator: function (this: IMongooseMatchPlayerSide, value: ServerSideBattleFieldCell.IMongooseServerSideBattleFieldCell[][]) {
            //         return this.FleetConfig == null // fleetconfig must have been set
            //             || (value != null // fleet config cannot be null
            //                 && value.length > 0); // fleet config cannot be emprty
            //     }
            // }
        }
    }, {
        id: false
    });
matchPlayerSideSchema.methods.configFleet = function (
    this: IMongooseMatchPlayerSide,
    matchSettings: MatchSettings.IMongooseMatchSettings,
    shipPlacements: ShipPlacement.IMongooseShipPlacement[]): boolean {

    // even tho default is null, at runtime it's never null, so we check if there are cells inside the array
    if (this.BattleFieldCells.length > 0) {
        // TODO: consider throwing something
        return false;
    }

    //this.FleetConfig = fleetConfig;
    const bfCells: game_server.ServerSideBattleFieldCell[][] = [];

    // create empty field
    for (let x = 0; x < matchSettings.BattleFieldWidth; x++) {
        bfCells[x] = [];
        for (let y = 0; y < matchSettings.BattleFieldHeight; y++) {
            bfCells[x][y] = new game_server.ServerSideBattleFieldCell();
        }
    }

    // place ships
    for (let sp of shipPlacements) {
        for (let i = 0; i < sp.Type; i++) {
            if (sp.Orientation == game.ShipOrientation.Horizontal)
                bfCells[sp.Coord.X + i][sp.Coord.Y] = new game_server.ServerSideBattleFieldCell(sp.Type);
            else
                bfCells[sp.Coord.X][sp.Coord.Y + i] = new game_server.ServerSideBattleFieldCell(sp.Type);
        }
    }

    //    this.BattleFieldCells = bfCells as ServerSideBattleFieldCell.IMongooseServerSideBattleFieldCell[][];
    for (let x = 0; x < bfCells.length; x++) {
        this.BattleFieldCells[x] = [];
        for (let y = 0; y < bfCells[x].length; y++) {
            this.BattleFieldCells[x][y] = bfCells[x][y] as ServerSideBattleFieldCell.IMongooseServerSideBattleFieldCell;
        }
    }

    // this.markModified("BattleFieldCells");

    return this.BattleFieldCells.length == matchSettings.BattleFieldWidth;
};
matchPlayerSideSchema.methods.receiveFire = function (this: IMongooseMatchPlayerSide, coord: Coord.IMongooseCoord): boolean {

    const cellStatus = this.BattleFieldCells[coord.X][coord.Y];

    // this check is here to allow blinded player to fire twice on the same cell, alternative might be to check if the player is blind before calling cell.receiveFire() to prevent cell from throwing an exception
    if (cellStatus.HasReceivedFire)
        throw new Error("This cell has already been shot to!");

    cellStatus.receiveFire();

    return cellStatus.HasReceivedFire;
};

export function getSchema() {
    return matchPlayerSideSchema;
}

// let playerSideModel;
// export function getModel(): mongoose.Model<IMongooseMatchPlayerSide> {
//     if (!playerSideModel) {
//         playerSideModel = mongoose.model(Constants.ModelsNames.MatchPlayerSide, playerSideModel);
//     }
//     return playerSideModel;
// }

// export function create(data: any): IMongooseMatchPlayerSide {
//     let matchModelCtor = getModel();
//     let newMatch = new matchModelCtor(data);

//     return newMatch;
// }