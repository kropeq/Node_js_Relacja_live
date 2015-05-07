var mongoose = require('mongoose');
var chatSchema = new mongoose.Schema({
    nick: String,
    message: String,
    time: Date
});

module.exports = mongoose.model('Chatpost', chatSchema);