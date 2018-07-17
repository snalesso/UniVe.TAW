import * as mongoose from 'mongoose';

import * as Constants from './Constants';
import * as Coord from './Coord';
import * as ShipPlacement from './ShipPlacement';
import * as ServerSideBattleFieldCell from './ServerSideBattleFieldCell';
import * as BattleFieldSettings from './BattleFieldSettings';

import * as game from '../../../../core/game';
import * as game_server from '../../../../core/game.server';
import * as game_client from '../../../../core/game.client';

// TODO: split validators into many single validators each with its own error message

export interface IMongooseMatchPlayerSide extends mongoose.Document {
    readonly PlayerId: mongoose.Types.ObjectId,
    FleetConfig: ReadonlyArray<ShipPlacement.IMongooseShipPlacement>,
    BattleFieldCells: ReadonlyArray<ReadonlyArray<ServerSideBattleFieldCell.IMongooseServerSideBattleFieldCell>>,
    // TODO: does it work if IMongooseX interfaces' methods take in pure TS classes?
    configFleet: (battleFieldSettings: BattleFieldSettings.IMongooseBattleFieldSettings, fleetConfig: ShipPlacement.IMongooseShipPlacement[]) => void,
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
        FleetConfig: {
            type: [ShipPlacement.getSchema()],
            validate: {
                validator: function validator(this: IMongooseMatchPlayerSide, value: ShipPlacement.IMongooseShipPlacement[]) {
                    return this.FleetConfig == null // fleetconfig cannot be changed once set
                        && value != null // fleet config cannot be null
                        && value.length > 0; // fleet config cannot be emprty
                }
            }
        },
        BattleFieldCells: {
            type: [[ServerSideBattleFieldCell.getSchema()]],
            validate: {
                validator: function (this: IMongooseMatchPlayerSide, value: ServerSideBattleFieldCell.IMongooseServerSideBattleFieldCell[][]) {
                    return this.FleetConfig != null // fleetconfig must have been set
                        && value != null // fleet config cannot be null
                        && value.length > 0; // fleet config cannot be emprty
                }
            }
        }
    }, {
        id: false
    });
matchPlayerSideSchema.methods.configFleet = function (
    this: IMongooseMatchPlayerSide,
    battleFieldSettings: BattleFieldSettings.IMongooseBattleFieldSettings,
    fleetConfig: ShipPlacement.IMongooseShipPlacement[]): void {

    // TODO: validate fleet config

    this.FleetConfig = fleetConfig;
    const bfCells = [];

    // create empty field
    for (let x = 0; x < battleFieldSettings.BattleFieldWidth; x++) {
        bfCells[x] = [];
        for (let y = 0; y < battleFieldSettings.BattleFieldHeight; y++) {
            bfCells[x][y] = new game_server.ServerSideBattleFieldCell();
        }
    }

    // place ships
    fleetConfig.forEach(sp => {
        for (let i = 0; i < sp.Type; i++) {
            if (sp.Orientation == game.ShipOrientation.Horizontal)
                bfCells[sp.Coord.X + i][sp.Coord.Y] = new game_server.ServerSideBattleFieldCell(sp.Type);
            else
                bfCells[sp.Coord.X][sp.Coord.Y + i] = new game_server.ServerSideBattleFieldCell(sp.Type);
        }
    });

    this.BattleFieldCells = bfCells;
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

let playerSideModel;
export function getModel(): mongoose.Model<IMongooseMatchPlayerSide> {
    if (!playerSideModel) {
        playerSideModel = mongoose.model(Constants.ModelsNames.Match, playerSideModel);
    }
    return playerSideModel;
}

export function create(data: any): IMongooseMatchPlayerSide {
    let matchModelCtor = getModel();
    let newMatch = new matchModelCtor(data);

    return newMatch;
}