// user model
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Event = new Schema({
  by_: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  address: { type: String, required: true },
  location: [{ type: Number, required: true }],
  name: { type: String, required: true },
  date: { type: Date },
  description: { type: String }
})

module.exports = mongoose.model('Event', Event)
