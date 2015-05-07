var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    nickname: String,
    password: String
});

module.exports = mongoose.model('User',userSchema);