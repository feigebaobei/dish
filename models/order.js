let mongoose = require('mongoose'),
  Schema = mongoose.Schema

require('mongoose-currency').loadType(mongoose)
const Currency = mongoose.Types.Currency

let dishSchema = new Schema({
  dish: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dishes'
  },
  amount: {
    type: Number,
    min: 0,
    required: true
  }
})

// let dishSchema = new Schema({
//   name: ''
// })

let orderSchema = new Schema({
  consumer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // dishes: [dishSchema]
  dishes: {
    type: [dishSchema],
    validate: [
      arr => {
        return arr.length > 0
      },
      'dishes of order is empty.'
    ]
  },
  totalPrice: {
    type: Currency,
    required: true,
    min: 0
  }
}, {
  timestamps: true
})

const Order = mongoose.model('Order', orderSchema)
module.exports = Order