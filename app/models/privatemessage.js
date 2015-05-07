var mongoose = require('mongoose');
var privateMessageSchema = new mongoose.Schema({
    nick: String,
    message: String,
    time: Date
});

module.exports = mongoose.model('PMpost',privateMessageSchema);