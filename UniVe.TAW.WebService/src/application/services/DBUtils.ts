import * as mongodb from 'mongodb';
import * as mongoose from 'mongoose';
import chalk from 'chalk';

import * as net from '../../infrastructure/net';
import * as game from '../../infrastructure/game';
import * as game_client from '../../infrastructure/game.client';
import * as utils from '../../infrastructure/utils';
import * as utils_2_8 from '../../infrastructure/utils-2.8';

import * as User from '../../domain/models/mongodb/mongoose/User';
import * as Match from '../../domain/models/mongodb/mongoose/Match';
import * as EndedMatch from '../../domain/models/mongodb/mongoose/EndedMatch';
import * as PendingMatch from '../../domain/models/mongodb/mongoose/PendingMatch';
import * as MatchSettings from '../../domain/models/mongodb/mongoose/MatchSettings';
import * as BattleFieldCell from '../../domain/models/mongodb/mongoose/BattleFieldCell';
import * as MatchPlayerSide from '../../domain/models/mongodb/mongoose/MatchPlayerSide';
import * as ShipTypeAvailability from '../../domain/models/mongodb/mongoose/ShipTypeAvailability';
import * as ShipPlacement from '../../domain/models/mongodb/mongoose/ShipPlacement';
import { Country, UserRoles } from '../../infrastructure/identity';
import moment = require('moment');

export default class DBUtils {

    public constructor() {
    }

    public static async deleteEverything() {

        console.log("deleting all pending matches ...");

        await PendingMatch.getModel().find().then(async pms => {

            for (let pm of pms) {
                await pm.remove();
                console.log("deleted PM (id: " + pm._id.toHexString() + ")");
            }
        }).catch(error => { console.log("error deleting pending match") });

        console.log("all pending matches deleted");
        console.log("deleting all matches ...");

        await Match.getModel().find().then(async matches => {

            for (let m of matches) {
                await m.remove();
                console.log("deleted M (id: " + m._id.toHexString() + ")");
            }
        }).catch(error => { console.log("error deleting match") });

        console.log("all matches deleted");
        console.log("deleting all users ...");

        await User.getModel().find().then(async users => {

            for (let u of users) {
                await u.remove();
                console.log("deleted U (id: " + u._id.toHexString() + ")");
            }
        }).catch(error => { console.log("error deleting user") });

        console.log("all users deleted");
    }

    public static async generateFakeData(usernames: string[], matchesCount: number) {

        console.log("generating fake data ...");

        // generates users

        const users: User.IMongooseUser[] = [];
        const countries = Object.keys(Country)
            .map(n => Number.parseInt(n))
            .filter(n => !Number.isNaN(n))

        for (const un of usernames) {
            const newUser = await User.create(
                {
                    Username: un,
                    CountryId: countries[utils.getRandomInt(0, countries.length - 1)],
                    BirthDate: moment().add(utils.getRandomInt(10, 80) * -1, "years").toDate(),
                    Roles: UserRoles.Player
                } as User.IMongooseUser);

            newUser.setPassword("aaa");
            await newUser.save();

            users.push(newUser);
        }

        // generates matches

        const matches: Match.IMongooseMatch[] = [];

        for (let mi = 1; mi <= matchesCount; mi++) {

            const fpsUser = users.splice(utils.getRandomInt(0, users.length - 1), 1)[0];
            const fps = {
                PlayerId: fpsUser._id
            } as utils_2_8.Mutable<MatchPlayerSide.IMongooseMatchPlayerSide>;
            const sps = {
                PlayerId: users[utils.getRandomInt(0, users.length - 1)]._id
            } as utils_2_8.Mutable<MatchPlayerSide.IMongooseMatchPlayerSide>;

            users.push(fpsUser);

            const newMatch = await Match
                .create(
                    {
                        Settings: {
                            // TODO: use default settings
                            MinShipsDistance: 2,
                            BattleFieldHeight: 10,
                            BattleFieldWidth: 10,
                            AvailableShips: [
                                { ShipType: game.ShipType.Destroyer, Count: 4 },
                                { ShipType: game.ShipType.Submarine, Count: 2 },
                                { ShipType: game.ShipType.Battleship, Count: 2 },
                                { ShipType: game.ShipType.Carrier, Count: 1 } as ShipTypeAvailability.IMongooseShipTypeAvailability
                            ] as ReadonlyArray<ShipTypeAvailability.IMongooseShipTypeAvailability>
                        } as MatchSettings.IMongooseMatchSettings,
                        FirstPlayerSide: fps,
                        SecondPlayerSide: sps
                    } as Match.IMongooseMatch);

            await newMatch.save();
            matches.push(newMatch);

            const p1fc = DBUtils.getRandomizedFleet(newMatch.FirstPlayerSide, newMatch.Settings);
            const p2fc = DBUtils.getRandomizedFleet(newMatch.FirstPlayerSide, newMatch.Settings);
            newMatch.configFleet(newMatch.FirstPlayerSide.PlayerId, p1fc);
            newMatch.configFleet(newMatch.SecondPlayerSide.PlayerId, p2fc);

            if (newMatch.areBothConfigured()) {

                const p1coords = DBUtils.generateCoordsList(newMatch.Settings.BattleFieldWidth, newMatch.Settings.BattleFieldHeight);
                const p2coords = DBUtils.generateCoordsList(newMatch.Settings.BattleFieldWidth, newMatch.Settings.BattleFieldHeight);

                while (!newMatch.EndDateTime) {
                    const coordsList = newMatch.InActionPlayerId.equals(newMatch.FirstPlayerSide.PlayerId) ? p1coords : p2coords;
                    const coord = coordsList.splice(utils.getRandomInt(0, coordsList.length - 1), 1)[0];
                    newMatch.fire(newMatch.InActionPlayerId, coord);
                }

                await newMatch.save();
            }
        }

        // move matches to ended match(es)

        for (let m of matches) {

            const em = {
                WinnerId: m.InActionPlayerId,
                EndDateTime: m.EndDateTime,
                StartDateTime: m.StartDateTime,
                CreationDateTime: m.CreationDateTime,
                FirstPlayerSide: m.FirstPlayerSide,
                SecondPlayerSide: m.SecondPlayerSide,
                Settings: m.Settings
            } as EndedMatch.IMongooseEndedMatch;

            const endedMatch = await EndedMatch.getModel().create(em);
            await m.remove();
            await endedMatch.save();
        }

        console.log("fake data generated");
    }

    public static generateCoordsList(width: number, height: number) {
        const coords = [];
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                coords.push(new game.Coord(x, y));
            }
        }

        return coords;
    }

    public static getRandomizedFleet(matchPlayerSide: MatchPlayerSide.IMongooseMatchPlayerSide, settings: MatchSettings.IMongooseMatchSettings) {

        const shipPlacements: game.ShipPlacement[] = [];

        const cells = new Array(settings.BattleFieldWidth);
        for (let x = 0; x < settings.BattleFieldWidth; x++) {
            cells[x] = new Array(settings.BattleFieldHeight);
            for (let y = 0; y < settings.BattleFieldHeight; y++) {
                cells[x][y] = { Coord: new game.Coord(x, y), ShipType: game.ShipType.NoShip };
            }
        }

        let sortedShipsTypesToPlace: game.ShipType[] = [];
        let shipTypeToPlace: game.ShipType;
        let rx: number;
        let ry: number;
        let rOrient: game.Orientation;
        let rPlacement: game.ShipPlacement;

        for (let avShip of settings.AvailableShips) {
            for (let i = 0; i < avShip.Count; i++) {
                sortedShipsTypesToPlace.push(avShip.ShipType);
            }
        }
        sortedShipsTypesToPlace = sortedShipsTypesToPlace.sort(); // sort from smallest to largest, so pop() will extract the largest

        while ((shipTypeToPlace = sortedShipsTypesToPlace.pop()) != null) {

            do {
                rOrient = utils.getRandomBoolean() ? game.Orientation.Vertical : game.Orientation.Horizontal;
                do {
                    rx = utils.getRandomInt(0, settings.BattleFieldWidth - (rOrient == game.Orientation.Horizontal ? shipTypeToPlace : 1));
                    ry = utils.getRandomInt(0, settings.BattleFieldHeight - (rOrient == game.Orientation.Vertical ? shipTypeToPlace : 1));
                } while (cells[rx][ry].ShipType != game.ShipType.NoShip);

                rPlacement = new game.ShipPlacement(shipTypeToPlace, new game.Coord(rx, ry), rOrient);

            } while (!game.FleetValidator.isValidShipPlacement(rPlacement, shipPlacements, settings as any as game.IMatchSettings));

            shipPlacements.push(rPlacement);
        }

        // generates grid cells from ship placements
        let coords: game.Coord[];
        for (let sp of shipPlacements) {
            coords = game.FleetValidator.getShipPlacementCoords(sp);
            for (let coord of coords) {
                cells[coord.X][coord.Y].ShipType = sp.Type;
            }
        }

        return shipPlacements.map(sp => ({ Type: sp.Type, Coord: sp.Coord, Orientation: sp.Orientation } as ShipPlacement.IMongooseShipPlacement));
    }
}