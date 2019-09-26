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
.get(cors.corsWithOptions, (req, res, next) => {
  // 感觉查所有的菜品不安全
  let {name, taste} = req.query
  taste = taste || []
  let option = {
    name: new RegExp(name, 'i'),
    taste: new RegExp(taste.length ? taste.join('|') : '', 'i')
  }
  Dish.find(option).then(dishes => {
    res.setHeader('Content-Type', 'application/json')
    res.status(200).json({result: true, data: dishes})
  }).catch(err => {
    res.setHeader('Content-Type', 'application/json')
    res.status(500).json({result: false, message: 'error for query'})
  })
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  let {name, description, price} = req.body
  let dish = new Dish({name: name, description: description, price: price})
  dish.save((err, doc) => {
    if (err) {
      res.status(500).json({result: false, message: '', error: err})
    } else {
      res.status(200).json({result: true, message: 'add dish successfully.', data: doc})
    }
  })
})
.put((req, res, next) => {
  res.send('put')
})
.delete((req, res, next) => {
  res.send('delete')
})

// router.route('/test')
// .options(cors.corsWithOptions, (req, res) => {
//   res.sendStatus(200)
// })
// .get()
// .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
//   res.status(200).json({key: 'value'})
// })

module.exports = router