let express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'),
  Order = require('../models/order'),
  cors = require('./cors'),
  authenticate = require('../authenticate')

router.use(bodyParser.json())

router.route('/')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.get(cors.corsWithOptions, (req, res, next) => {
  res.send('get')
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  // res.send('post')
  if (!Array.isArray(req.body.order)) {
    next()
    return
  }
  let dishes = req.body.order.reduce((r, c) => {
    r.push({
      dish: c.id,
      amount: c.amount
    })
    return r
  }, [])
  let order = new Order({
    consumer: req.user._id,
    dishes: dishes
  })
  order.save().then(order => {
    if (order) {
      Order.findById(order._id)
        // .populate('consumer')
        .populate('Order.dishes')
        .then(order => {
          // 肯定能查到订单
          res.setHeader('Content-Type', 'application/json')
          res.status(200).json({reuslt: true, message: '', data: order})
        })
        .catch(err => {
          next(err)
        })
    } else {
      next()
    }
  }).catch(err => next(err))
})
.put(cors.corsWithOptions, (req, res, next) => {
  res.send('put')
})
.delete(cors.corsWithOptions, (req, res, next) => {
  res.send('delete')
})

module.exports = router