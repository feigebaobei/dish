// var mongoose = require('mongoose')
var {Schema, model} = require('mongoose')
var passportLocalMongoose = require('passport-local-mongoose')
var User = new Schema({
  // passport-local-mongoose 会添加username / password字段
  firstname: {
    type: String,
    defautl: ''
  },
  lastname: {
    type: String,
    defautl: ''
  },
  admin: {
    type: Boolean,
    defautl: false
  }
})
User.plugin(passportLocalMongoose)

module.exports = model('User', User)