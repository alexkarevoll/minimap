// user model
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose')

var User = new Schema({
  username: String,
  password: String,
  events: [{type: mongoose.Schema.Types.ObjectId, ref:'Event'}]
})

User.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', User)
