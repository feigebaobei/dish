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
        console.log('string')
        passport.authenticate('local')(req, res, () => {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.json({resulte: true, message: 'registration successful!'})
        })
      })
    }
  })
})
router.post('/login', passport.authenticate('local'), (req, res, next) => {
  console.log(req.user)
  let token = authenticate.getToken({_id: req.user._id})
  res.setHeader('Content-Type', 'application/json')
  res.cookie('token', token, {httpOnly: true})
  res.status(200).json({resulte: true, token: token, message: 'You are successful logged in!'})
})
router.post('/logout', (req, res, next) => {
  if (req.cookies.token) {
    res.clearCookie('token')
    res.setHeader('Content-Type', 'application/json')
    res.status(200).json({resulte: true, message: 'logout success.'})
  } else {
    res.status(403).json({resulte: false, message: ''})
  }
})

module.exports = router;
