let mongoose = require('mongoose')
let Schema = mongoose.Schema
require('mongoose-currency').loadType(mongoose)
const Currency = mongoose.Types.Currency

let dishSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Currency,
    required: true,
    min: 0
  },
  delete: {
    type: Boolean,
    default: false
  }
  // comments: []
}, {
  timestamps: true
})

const Dishes = mongoose.model('Dish', dishSchema)
module.exports = Dishes