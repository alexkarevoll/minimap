// user model
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Event = new Schema({
  by_: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  address: { type: String },
  location: [{ type: Number, required: true }],
  name: { type: String }
})

module.exports = mongoose.model('Event', Event)
