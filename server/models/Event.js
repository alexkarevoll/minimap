// user model
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Event = new Schema({
  by_: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  name: String
})

module.exports = mongoose.model('events', Event)
