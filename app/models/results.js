var mongoose = require('mongoose');
var resultsSchema = new mongoose.Schema({
    jumper: String,
    nation: String,
    jump1: Number,
    wind1: Number,
    nota1: Number,
    nota2: Number,
    nota3: Number,
    nota4: Number,
    nota5: Number,
    points1: Number,
    jump2: Number,
    wind2: Number,
    nota6: Number,
    nota7: Number,
    nota8: Number,
    nota9: Number,
    nota10: Number,
    points2: Number,
    result: Number
});

module.exports = mongoose.model('Resultspost', resultsSchema);