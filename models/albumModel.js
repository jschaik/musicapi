const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const albumModel = new Schema({
    title: {
        type: String
    },
    artist: {
        type: String
    },
    tracks: {
        type: String
    },
    year: {
        type: String
    }
});

module.exports = mongoose.model('Album', albumModel);
