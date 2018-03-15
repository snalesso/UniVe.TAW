import * as mongoose from 'mongoose';

let userSchema = new mongoose.Schema({
    Id: Number,
    Username: {
        type: String,
        unique: true,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    BirthDate: Date,
    Country: {
        type: String,
        required: true
    }
});

export default mongoose.model('User', userSchema);