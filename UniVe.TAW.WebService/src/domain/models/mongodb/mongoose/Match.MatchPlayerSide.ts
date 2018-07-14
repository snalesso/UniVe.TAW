import * as mongoose from 'mongoose';
import * as Constants from './Constants';
import * as game from '../../../../core/game';
import * as game_server from '../../../../core/game.server';
import * as game_client from '../../../../core/game.client';

// TODO: split validators into many single validators each with its own error message

export interface IMongooseMatchPlayerSide extends mongoose.Document {
    readonly PlayerId: mongoose.Types.ObjectId,
    FleetConfig: game.ShipPlacement[],
    BattleFieldCells: game_server.ServerSideBattleFieldCell[][],
    configFleet: (battleFieldSettings: game.BattleFieldSettings, fleetConfig: game.ShipPlacement[]) => void,
    // getOwnerView: () => game_client.ClientSideBattleFieldCell_Owner[][],
    // getEnemyView: () => game_client.ClientSideBattleFieldCell_Enemy[][],
    receiveFire: (coord: game.Coord) => boolean // returns true if something has been hit, false if water, exception if it was already hit
}

const matchPlayerSideSchema = new mongoose.Schema(
    {
        PlayerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Constants.ModelsNames.User,
            required: true
        },
        FleetConfig: {
            type: [game.ShipPlacement],
            validate: {
                validator: function (value: game.ShipPlacement[]) {
                    return this.FleetConfig == null // fleetconfig cannot be changed once set
                        && value != null // fleet config cannot be null
                        && value.length > 0; // fleet config cannot be emprty
                }
            }
        },
        BattleFieldCells: {
            type: [[game_server.ServerSideBattleFieldCell]],
            validate: {
                validator: function (value: game_server.ServerSideBattleFieldCell[][]) {
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
    battleFieldSettings: game.BattleFieldSettings,
    fleetConfig: game.ShipPlacement[]): void {

    // TODO: validate fleet config

    const _this = (this as IMongooseMatchPlayerSide);
    _this.FleetConfig = fleetConfig;
    _this.BattleFieldCells = [];

    // create empty field
    for (let x = 0; x < battleFieldSettings.BattleFieldWidth; x++) {
        _this.BattleFieldCells[x] = [];
        for (let y = 0; y < battleFieldSettings.BattleFieldHeight; y++) {
            _this.BattleFieldCells[x][y] = new game_server.ServerSideBattleFieldCell();
        }
    }

    // place ships
    fleetConfig.forEach(sp => {
        for (let i = 0; i < sp.Type; i++) {
            if (sp.Orientation == game.ShipOrientation.Horizontal)
                _this.BattleFieldCells[sp.Coord.X + i][sp.Coord.Y] = new game_server.ServerSideBattleFieldCell(sp.Type);
            else
                _this.BattleFieldCells[sp.Coord.X][sp.Coord.Y + i] = new game_server.ServerSideBattleFieldCell(sp.Type);
        }
    });
};
matchPlayerSideSchema.methods.receiveFire = function (coord: game.Coord): void {

    const _this = (this as IMongooseMatchPlayerSide);
    const cellStatus = _this.BattleFieldCells[coord.X][coord.Y];

    if (cellStatus.HasReceivedFire)
        throw new Error("This cell has already been shot to!");

    this._receiveFireDateTime = new Date();
    this._hasReceivedFire = true;

    return this.HasReceivedFire;
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