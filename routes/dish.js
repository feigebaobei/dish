let express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'),
  Dish = require('../models/dish'),
  authenticate = require('../authenticate'),
  cors = require('./cors')

router.use(bodyParser.json())

router.route('/')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.get((req, res, next) => {
  // 感觉查所有的菜品不安全
  Dish.find({}).then(dishes => {
    res.setHeader('Content-Type', 'application/json')
    res.status(200).json({result: true, data: dishes})
  }).catch(err => {
    res.setHeader('Content-Type', 'application/json')
    res.status(500).json({result: false, message: 'error for query'})
  })
})
.post(authenticate.verifyUser, (req, res, next) => {
  let {name, description, price} = req.body
  let dish = new Dish({name: name, description: description, price: price})
  dish.save((err, doc) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).json({result: false, message: '', error: err})
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).json({result: true, message: 'add dish successfully.'})
    }
  })
})
.put((req, res, next) => {
  res.send('put')
})
.delete((req, res, next) => {
  res.send('delete')
})

module.exports = router