var mongoose = require('mongoose');
var newsSchema = mongoose.Schema({
    title: String,
    content: String,
    time: Date
});

module.exports = mongoose.model('News',newsSchema);