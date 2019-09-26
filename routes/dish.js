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
  let {name, taste, page, size} = req.query
  taste = taste || []
  let filter = {
    name: new RegExp(name, 'i'),
    taste: new RegExp(taste.length ? taste.join('|') : '', 'i')
  }
  Dish.count(filter).exec().then(amount => {
    // 最多100页，每页最多200条
    page = page < -1 ? 0 : page
    page = page > 100 ? 100 : page
    size = size > 200 ? 200 : size
    size = size < -1 ? 0 : size
    let setOptions = {
      skip: page * size,
      limit: size
    }
    Dish.find(filter, null, setOptions).exec().then(dishes => {
      res.setHeader('Content-Type', 'application/json')
      res.status(200).json({
        result: true,
        data: {
          dishes: dishes,
          amount: amount
        }
      })
    })
  }).catch(err => {
    res.status(500).json({result: false, message: 'error for query'})
  })
  // Dish.find(filter, null, setOptions).then(dishes => {
  //   res.setHeader('Content-Type', 'application/json')
  //   res.status(200).json({result: true, data: {dishes: dishes, amount: ''}})
  // }).catch(err => {
  //   res.setHeader('Content-Type', 'application/json')
  //   res.status(500).json({result: false, message: 'error for query'})
  // })
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