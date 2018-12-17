// import * as mongoose from 'mongoose';
// import * as game from '../../../../infrastructure/game';
// import * as game_server from '../../../../infrastructure/game.server';
// import * as identity from '../../../../infrastructure/identity';

// export interface IMongooseBattleFieldCell extends mongoose.Document {
//     readonly ShipType: game.ShipType;
//     FireReceivedDateTime: Date;
// }
// export interface IMongooseChatMessage extends mongoose.Document {
//     Text: string;
//     Timestamp: Date;
// }
// export interface IMongooseEndedMatch extends mongoose.Document {
//     readonly _id: mongoose.Types.ObjectId,
//     readonly Settings: IMongooseMatchSettings,
//     readonly CreationDateTime: Date,
//     readonly StartDateTime: Date,
//     readonly EndDateTime: Date,
//     readonly WinnerId: mongoose.Types.ObjectId,
//     readonly FirstPlayerSide: IMongooseMatchPlayerSide,
//     readonly SecondPlayerSide: IMongooseMatchPlayerSide
// }
// export interface IMongooseMatchSettings extends mongoose.Document {
//     readonly BattleFieldWidth: number;
//     readonly BattleFieldHeight: number;
//     readonly AvailableShips: ReadonlyArray<IMongooseShipTypeAvailability>;
//     readonly MinShipsDistance: number;
// }
// export interface IMongooseShipTypeAvailability extends mongoose.Document {
//     readonly ShipType: game.ShipType;
//     readonly Count: number;
// }
// export interface IMongooseEndedMatchPlayerSide extends mongoose.Document {
//     readonly PlayerId: mongoose.Types.ObjectId,
//     readonly BattleFieldCells: IMongooseBattleFieldCell[][]
// }
// export interface IMongooseMatchPlayerSide extends mongoose.Document {
//     readonly PlayerId: mongoose.Types.ObjectId,
//     BattleFieldCells: IMongooseBattleFieldCell[][],
//     isConfigured(matchSettings: IMongooseMatchSettings): boolean,
//     configFleet(matchSettings: IMongooseMatchSettings, shipPlacements: IMongooseShipPlacement[]): boolean,
//     /** returns true if hit, false if water, exception if it was already hit */
//     receiveFire(coord: game.Coord): boolean,
//     areAllShipsHit(): boolean
// }
// export interface IMongooseShipPlacement extends mongoose.Document {
//     readonly Type: game.ShipType;
//     readonly Coord: game.Coord;
//     readonly Orientation: game.Orientation;
// }
// export interface IMongooseUser extends mongoose.Document {
//     readonly _id: mongoose.Types.ObjectId,
//     readonly Username: string,
//     readonly RegistrationDate: Date,
//     BirthDate: Date,
//     CountryId: identity.Country,
//     Roles: identity.UserRoles,
//     Salt: string,
//     Digest: string,
//     SentMessages: Map<String, IMongooseChatMessage[]>,
//     BannedUntil: Date,
//     setPassword(pwd: string): void,
//     validatePassword(pwd: string): boolean,
//     getAge(): number,
//     logMessage(addresseeId: mongoose.Types.ObjectId, text: string): IMongooseChatMessage
// }
// export interface IMongoosePendingMatch extends mongoose.Document {
//     readonly _id: mongoose.Types.ObjectId,
//     readonly PlayerId: mongoose.Types.ObjectId
// }
// export interface IMongooseMatch extends mongoose.Document {
//     readonly _id: mongoose.Types.ObjectId,
//     readonly Settings: IMongooseMatchSettings,
//     readonly CreationDateTime: Date,
//     StartDateTime: Date,
//     EndDateTime: Date,
//     InActionPlayerId: mongoose.Types.ObjectId,
//     FirstPlayerSide: IMongooseMatchPlayerSide,
//     SecondPlayerSide: IMongooseMatchPlayerSide,
//     areBothConfigured(): boolean,
//     configFleet(playerId: mongoose.Types.ObjectId, shipPlacements: IMongooseShipPlacement[]): boolean,
//     /** returns true if a ship was hit, false if water, exception if it was already hit */
//     fire(firingPlayerId: mongoose.Types.ObjectId, targetCoord: game.Coord): boolean,
//     getOwnerMatchPlayerSide(playerId: mongoose.Types.ObjectId): IMongooseMatchPlayerSide,
//     getEnemyMatchPlayerSide(playerId: mongoose.Types.ObjectId): IMongooseMatchPlayerSide
// }