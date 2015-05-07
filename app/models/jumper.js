var mongoose = require('mongoose');
var jumperSchema = new mongoose.Schema({
    bib: Number,
    name: String,
    surname: String
});

module.exports = mongoose.model('Jumperpost', jumperSchema);
