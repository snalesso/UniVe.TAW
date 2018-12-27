import * as express from 'express';
import * as mongoose from 'mongoose';
import * as httpStatusCodes from 'http-status-codes';
import * as mongodb from 'mongodb';
import * as socketio from 'socket.io';

import * as net from '../infrastructure/net';
import * as game from '../infrastructure/game';
import * as game_client from '../infrastructure/game.client';
import * as utils from '../infrastructure/utils';
import * as utilsV2_8 from '../infrastructure/utils-2.8';

import ServiceEventKeys from './services/ServiceEventKeys';
import * as User from '../domain/models/mongodb/mongoose/User';
import * as Match from '../domain/models/mongodb/mongoose/Match';
import * as EndedMatch from '../domain/models/mongodb/mongoose/EndedMatch';
import * as PendingMatch from '../domain/models/mongodb/mongoose/PendingMatch';

import * as identityDTOs from './DTOs/identity';
import * as gameDTOs from './DTOs/game';
import * as chatDTOs from './DTOs/chat';

import chalk from 'chalk';

export default class DataManager {

    public static async GetPlayables(userId: mongoose.Types.ObjectId) {

        const playables = {} as gameDTOs.IPlayablesDto;

        try {
            const pendingMatch = await this.GetPendingMatch(userId);
            if (pendingMatch) {
                playables.PendingMatchId = pendingMatch.id;
            }
            try {
                const playingMatch = await this.GetPlayingMatch(userId);
                if (playingMatch != null) {
                    playables.PlayingMatchId = playingMatch._id.toHexString();
                }
                playables.CanCreateMatch = (playables.PendingMatchId == null && playables.PlayingMatchId == null);
                // if can't create a match it means can't join, then it's useless to query joinable matches
                if (!playables.CanCreateMatch) {
                    return playables;
                }
                try {
                    const joinableMatches = await PendingMatch.getModel()
                        .find({ PlayerId: { $ne: userId } })
                        .populate({ path: "PlayerId", model: User.getModel() })
                        .exec();

                    playables.JoinableMatches = joinableMatches.map(jm => {
                        const creator = (jm.PlayerId as any as User.IMongooseUser);
                        return {
                            Id: jm._id.toHexString(),
                            Creator: {
                                Id: creator._id.toHexString(),
                                Username: creator.Username,
                                Age: creator.getAge(),
                                CountryId: creator.CountryId
                            }
                        } as gameDTOs.IJoinableMatchDto;
                    });

                    return playables;
                }
                catch (error) {
                    console.log(error);
                    return null as gameDTOs.IPlayablesDto;
                }
            }
            catch (error_1) {
                console.log(error_1);
                return null as gameDTOs.IPlayablesDto;
            }
        }
        catch (error_2) {
            console.log(error_2);
            return null as gameDTOs.IPlayablesDto;
        }
    }

    public static async GetPlayingMatch(userId: mongoose.Types.ObjectId) {

        try {
            const playingMatch = await Match.getModel()
                .findOne({ $or: [{ "FirstPlayerSide.PlayerId": userId }, { "SecondPlayerSide.PlayerId": userId }] })
                .exec();
            return playingMatch;
        }
        catch (error) {
            // TODO: handle
            console.log(chalk.red("+++ Why are we here?"));
            throw new Error("WTF");
        }
    }

    public static async GetPendingMatch(userId: mongoose.Types.ObjectId) {

        const criteria = { PlayerId: userId } as utilsV2_8.Mutable<PendingMatch.IMongoosePendingMatch>;

        try {
            const pendingMatch = await PendingMatch.getModel()
                .findOne(criteria)
                .exec();
            return pendingMatch;
        }
        catch (error) {
            // TODO: handle
            console.log(chalk.red("+++ Why are we here?"));
            throw new Error("WTF");
        }
    }

    public static async HasOpenMatches(userId: mongoose.Types.ObjectId): Promise<boolean> {

        try {
            const pendingMatch = await this.GetPendingMatch(userId);
            if (pendingMatch)
                return true;
            try {
                const match = await this.GetPlayingMatch(userId);
                return match != null;
            }
            catch (error) {
                // TODO: handle
                console.log(chalk.red("+++ Why are we here?"));
                throw new Error("WTF");
            }
        }
        catch (error_1) {
            // TODO: handle
            console.log(chalk.red("+++ Why are we here?"));
            throw new Error("WTF");
        }
    }
}