var express = require('express');
var router = express.Router();
var User = require('../models/user')
var passport = require('passport')
var bodyParser = require('body-parser')
var authenticate = require('../authenticate')
router.use(bodyParser.json())

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 500
      res.json({error: err})
    } else {
      if (req.body.firstname) user.firstname = req.body.firstname
      if (req.body.lastname) user.lastname = req.body.lastname
      user.save((err, user) => {
        if (err) {
          res.setHeader('Content-Type', 'application/json')
          res.status(500).json({error: err})
        }
        passport.authenticate('local')(req, res, () => {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.json({result: true, message: 'registration successful!'})
        })
      })
    }
  })
})
router.post('/login', passport.authenticate('local'), (req, res, next) => {
  let token = authenticate.getToken({_id: req.user._id})
  res.setHeader('Content-Type', 'application/json')
  res.cookie('token', token, {httpOnly: true})
  res.status(200).json({result: true, token: token, message: 'You are successful logged in!'})
})
router.post('/logout', (req, res, next) => {
  if (req.cookies.token) {
    res.cookie('token', null, {httpOnly: true, expires: new Date()})
    res.setHeader('Content-Type', 'application/json')
    res.status(200).json({result: true, message: 'logout success.'})
  } else {
    res.status(403).json({result: false, message: ''})
  }
})

module.exports = router;
