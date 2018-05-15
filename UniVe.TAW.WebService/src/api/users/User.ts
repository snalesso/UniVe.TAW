import * as mongoose from 'mongoose';
import crypto = require('crypto');

export interface User extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    username: string,
    //mail: string,
    //roles: string[],
    countryId: number,
    salt: string,
    digest: string,
    setPassword: (pwd: string) => void,
    validatePassword: (pwd: string) => boolean
}

const userSchema = new mongoose.Schema({
    // Id: mongoose.Types.ObjectId,
    username: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        required: true
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    birthDate: {
        type: mongoose.SchemaTypes.Date,
        required: false
    },
    countryId: {
        type: mongoose.SchemaTypes.Number,
        required: false
    },
    salt: {
        type: mongoose.SchemaTypes.String,
        required: false
    },
    digest: {
        type: mongoose.SchemaTypes.String,
        required: false
    }
});

userSchema.methods.setPassword = (pwd: string) => {

    this.salt = crypto.randomBytes(16).toString('hex'); // We use a random 16-bytes hex string for salt

    // We use the hash function sha512 to hash both the password and salt to
    // obtain a password digest
    //
    // From wikipedia: (https://en.wikipedia.org/wiki/HMAC)
    // In cryptography, an HMAC (sometimes disabbreviated as either keyed-hash message
    // authentication code or hash-based message authentication code) is a specific type
    // of message authentication code (MAC) involving a cryptographic hash function and
    // a secret cryptographic key.
    //
    var hmac = crypto.createHmac('sha512', this.salt);
    hmac.update(pwd);
    this.digest = hmac.digest('hex'); // The final digest depends both by the password and the salt
};
userSchema.methods.validatePassword = (pwd: string): boolean => {

    // To validate the password, we compute the digest with the
    // same HMAC to check if it matches with the digest we stored
    // in the database.
    //
    var hmac = crypto.createHmac('sha512', this.salt);
    hmac.update(pwd);
    var digest = hmac.digest('hex');
    return (this.digest === digest);
}

export function getSchema() { return userSchema; }

// Mongoose Model
let userModel;  // This is not exposed outside the model
export function getModel(): mongoose.Model<User> { // Return Model as singleton
    if (!userModel) {
        userModel = mongoose.model('User', getSchema())
    }
    return userModel;
}

export function create(data): User {
    var userModelCtor = getModel();
    var user = new userModelCtor(data);

    return user;
}