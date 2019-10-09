let express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'),
  Order = require('../models/order'),
  Dish = require('../models/dish'),
  cors = require('./cors'),
  authenticate = require('../authenticate'),
  util = require('../util')

router.use(bodyParser.json())

router.route('/')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  console.log(req.query)
  let page = util.range(Number(req.query.page), 0, 100)
  let size = util.range(Number(req.query.size), 0, 200)
  let setOptions = {
    skip: page * size,
    limit: Number(size)
  }
  Order.find({consumer: req.user._id}, null, setOptions).populate('dishes.dish').exec().then(orderes => {
    console.log(orderes)
    if (orderes) {
        res.setHeader('Content-Type', 'application/json')
        res.status(200).json({result: true, message: '', data: orderes})
    } else {
      next()
    }
  }).catch(err => {
    console.log(err)
  })
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  // res.send('post')
  if (!Array.isArray(req.body.order)) {
    next()
  }
  let opPromise = arr => {
    return arr.reduce((res, cur) => {
      let p = Dish.findById(cur.id)
      res.push(p)
      return res
    }, [])
  }
  let opPrice = (order, dishes) => {
    return order.reduce((r, o) => {
      let d = dishes.find(item => String(item._id) === o.id)
      console.log(d)
      return r += o.amount * d.price
    }, 0)
  }
  Promise.all(opPromise(req.body.order)).then(dishes => {
    console.log(req.body.order, dishes)
    let order = new Order({
      consumer: req.user._id,
      dishes: req.body.order.reduce((r, c) => {
        r.push({
          dish: c.id,
          amount: c.amount
        })
        return r
      }, []),
      totalPrice: opPrice(req.body.order, dishes)
    })
    order.save().then(order => {
      if (order) {
        Order.findById(order._id)
          // .populate('consumer')
          .populate('Order.dishes')
          .then(order => {
            // 肯定能查到订单
            res.setHeader('Content-Type', 'application/json')
            res.status(200).json({result: true, message: '', data: order})
          })
          .catch(err => {
            next(err)
          })
      } else {
        next()
      }
    }).catch(err => next(err))
  }).catch(err => {
    next(err)
  })
})
.put(cors.corsWithOptions, (req, res, next) => {
  res.send('put')
})
.delete(cors.corsWithOptions, (req, res, next) => {
  res.send('delete')
})

// router.route('/')
// .options(cors.corsWithOptions, (req, res) => {
//   res.sendStatus(200)
// })
// .get(cors.corsWithOptions, (req, res, next) => {
//   res.send('get')
// })
// .post(cors.corsWithOptions, (req, res, next) => {
//   res.send('post')
// })
// .put(cors.corsWithOptions, (req, res, next) => {
//   res.send('put')
// })
// .delete(cors.corsWithOptions, (req, res, next) => {
//   res.send('delete')
// })

module.exports = router