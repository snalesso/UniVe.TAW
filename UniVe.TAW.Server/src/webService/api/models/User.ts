import * as mongoose from 'mongoose';

let userSchema = new mongoose.Schema({
    // Id: mongoose.Types.ObjectId,
    Username: {
        type: String,
        unique: true,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    BirthDate: {
        type: Date,
        required: false
    },
    CountryId: {
        type: Number,
        required: false
    }
});

export default mongoose.model('User', userSchema);