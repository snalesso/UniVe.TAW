import * as mongoose from 'mongoose';

import * as Constants from './Constants';
import * as Coord from './Coord';
import * as ShipPlacement from './ShipPlacement';
import * as ServerSideBattleFieldCell from './BattleFieldCell';
//import * as BattleFieldSettings from './BattleFieldSettings';
import * as MatchSettings from './MatchSettings';

import * as game from '../../../../infrastructure/game';
import * as game_server from '../../../../infrastructure/game.server';
import * as utils_2_8 from '../../../../infrastructure/utils-2.8';

// TODO: split validators into many single validators each with its own error message

export interface IMongooseMatchPlayerSide extends mongoose.Document {
    readonly PlayerId: mongoose.Types.ObjectId,
    BattleFieldCells: ServerSideBattleFieldCell.IMongooseBattleFieldCell[][],
    isConfigured(matchSettings: MatchSettings.IMongooseMatchSettings): boolean,
    configFleet(matchSettings: MatchSettings.IMongooseMatchSettings, shipPlacements: ShipPlacement.IMongooseShipPlacement[]): boolean,
    /** returns true if hit, false if water, exception if it was already hit */
    receiveFire(coord: game.Coord): boolean,
    areAllShipsHit(): boolean
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
matchPlayerSideSchema.methods.isConfigured = function (
    this: IMongooseMatchPlayerSide): boolean {
    return this.BattleFieldCells.length > 0;
};
matchPlayerSideSchema.methods.configFleet = function (
    this: IMongooseMatchPlayerSide,
    matchSettings: MatchSettings.IMongooseMatchSettings,
    shipPlacements: ShipPlacement.IMongooseShipPlacement[]): boolean {

    // even tho default is null, at runtime it's never null, so we check if there are cells inside the array
    if (this.isConfigured(matchSettings)) {
        // TODO: consider throwing something
        return false;
    }

    const bfCells: game_server.IBattleFieldCell[][] = [];

    // create empty field
    for (let x = 0; x < matchSettings.BattleFieldWidth; x++) {
        bfCells[x] = [];
        for (let y = 0; y < matchSettings.BattleFieldHeight; y++) {
            bfCells[x][y] = { ShipType: game.ShipType.NoShip, FireReceivedDateTime: null } as game_server.IBattleFieldCell;
        }
    }

    // place ships
    for (let sp of shipPlacements) {
        for (let i = 0; i < sp.Type; i++) {
            let cell = (sp.Orientation == game.Orientation.Horizontal) ? bfCells[sp.Coord.X + i][sp.Coord.Y] : bfCells[sp.Coord.X][sp.Coord.Y + i];
            (cell as utils_2_8.Mutable<game_server.IBattleFieldCell>).ShipType = sp.Type;
        }
    }

    for (let x = 0; x < bfCells.length; x++) {
        this.BattleFieldCells[x] = [];
        for (let y = 0; y < bfCells[x].length; y++) {
            this.BattleFieldCells[x][y] = bfCells[x][y] as ServerSideBattleFieldCell.IMongooseBattleFieldCell;
        }
    }

    this.markModified("BattleFieldCells");

    return this.isConfigured(matchSettings);
};
matchPlayerSideSchema.methods.receiveFire = function (
    this: IMongooseMatchPlayerSide,
    coord: game.Coord): boolean {

    if (coord == null)
        throw new Error("Coord cannot be null");

    const cell = this.BattleFieldCells[coord.X][coord.Y];
    if (cell.FireReceivedDateTime != null)
        throw new Error("This cell has already been shot to!");

    try {
        cell.FireReceivedDateTime = new Date();
        this.markModified("BattleFieldCells");
    }
    catch (ex) {
        console.log(ex);
    }
    finally {
        return (cell.ShipType != game.ShipType.NoShip);
    }
};
matchPlayerSideSchema.methods.areAllShipsHit = function (
    this: IMongooseMatchPlayerSide): boolean {

    for (let row of this.BattleFieldCells) {
        for (let cell of row) {
            // if there is at least one cell which contains a ship
            // and that ship is not hit, return false
            if (cell.ShipType != game.ShipType.NoShip
                && cell.FireReceivedDateTime == null)
                return false;
        }
    }

    return true;
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