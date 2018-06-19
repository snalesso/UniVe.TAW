import * as mongoose from 'mongoose';

export interface IMongooseMatch extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    FirstPlayerId: mongoose.Schema.Types.ObjectId,
    SecondPlayerId: mongoose.Schema.Types.ObjectId,
    // PlayersPairingMode: challenge/random
    CreationDateTime: Date
}

const matchSchema = new mongoose.Schema({
});

//export function getSchema() { return MatchSchema; }

// Mongoose Model
let matchModel;  // This is not exposed outside the model
export function GetModel(): mongoose.Model<IMongooseMatch> { // Return Model as singleton
    if (!matchModel) {
        matchModel = mongoose.model('Match', matchSchema); // getSchema());
    }
    return matchModel;
}

export function Create(data: any): IMongooseMatch {
    let matchModelCtor = GetModel();
    let newMatch = new matchModelCtor(data);

    return newMatch;
}