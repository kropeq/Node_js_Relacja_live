var mongoose = require('mongoose');
var responseSchema = new mongoose.Schema({
    nick: String,
    message: String,
    time: Date
});

module.exports = mongoose.model('Responsepost', responseSchema);