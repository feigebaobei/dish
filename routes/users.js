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
          res.json({success: true, status: 'registration successful!'})
        })
      })
    }
  })
})
router.post('/login', (req, res, next) => {})
router.post('/logout', (req, res, next) => {})

module.exports = router;
