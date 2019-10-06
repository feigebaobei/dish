let express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'),
  Dish = require('../models/dish'),
  authenticate = require('../authenticate'),
  cors = require('./cors'),
  multer = require('multer'),
  config = require('../config'),
  fs = require('fs')
  // formidable = require('express-formidabe')

router.use(bodyParser.json())

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images')
  },
  filename: (req, file, cb) => {
    let reg = new RegExp(`^.*(?=\.(${config.imageExtend.join('|')})$)`)
    let res = file.originalname.match(reg)
    let [name, extend] = res
    // [name, extend, index: n, input: 'string', group: undefined]
    // 原始名称 + 时间戳 + 5位随机数
    cb(null, `${name}${Date.now()}${Math.floor(Math.random() * 100000)}.${extend}`)
    // cb(null, `${file.originalname}-${Date.now()}`)
  }
})
var imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('You can upload only image files!'), false)
  }
  cb(null, true)
}
var upload = multer({
  storage: storage,
  fileFilter: imageFileFilter
})

router.route('/')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.get(cors.corsWithOptions, (req, res, next) => {
  let {name, taste, page, size} = req.query
  taste = taste || []
  let filter = {
    delete: {$not: {$eq: true}}
  }
  if (name) {
    filter.name = new RegExp(name, 'i')
  }
  if (taste.length) {
    filter.taste = {$in: taste.map((item) => {
      return Number(item)
    })}
  }
  Dish.countDocuments(filter).exec().then(amount => {
    // res.status(200).json({data: {amount: amount}})
    // // res.send(amount)
    // // 最多100页，每页最多200条
    page = page < -1 ? 0 : page
    page = page > 100 ? 100 : page
    size = size > 200 ? 200 : size
    size = size < -1 ? 0 : size
    let setOptions = {
      skip: page * size,
      limit: Number(size)
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
    res.status(500).json({result: false, message: 'error for query', error: err})
  })
})
.post(cors.corsWithOptions, authenticate.verifyUser, upload.fields([
    {name: 'imageBig', maxCount: 1},
    {name: 'imageMiddle', maxCount: 1},
    {name: 'imageSmall', maxCount: 1}
  ]), (req, res, next) => {
  // console.log('files', req.files)
  console.log('body', req.body)
  let {name, description, taste, price, compose, status, category, series} = req.body
  let dish = new Dish({
    imageBig: `${req.files.imageBig[0].destination}/${req.files.imageBig[0].filename}`,
    imageMiddle: `${req.files.imageMiddle[0].destination}/${req.files.imageMiddle[0].filename}`,
    imageSmall: `${req.files.imageSmall[0].destination}/${req.files.imageSmall[0].filename}`,
    name: name,
    description: description,
    taste: taste,
    price: price,
    compose: compose,
    status: status,
    category: category,
    series: series
  })
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

router.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.get(cors.corsWithOptions, (req, res, next) => {
  let dishId = req.params.dishId
  Dish.findById(dishId).exec().then(dish => {
    // 价格的单位由分变为元的工作在前端做
    res.status(200).json({result: true, message: '', data: dish})
  }).catch(err => {
    res.status(500).json({result: false, message: '', error: err})
  })
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  res.status(404).json({result: false, message: '', error: {}})
})
.put(cors.corsWithOptions, authenticate.verifyUser, upload.fields([
    {name: 'imageBig', maxCount: 1},
    {name: 'imageMiddle', maxCount: 1},
    {name: 'imageSmall', maxCount: 1}
  ]), (req, res, next) => {
  let {name, description, taste, price, compose, status, category, series} = req.body
  // console.log(req.files)
  // console.log(req.body)
  let o = {
    imageBig: `${req.files.imageBig[0].destination}/${req.files.imageBig[0].filename}`,
    imageMiddle: `${req.files.imageMiddle[0].destination}/${req.files.imageMiddle[0].filename}`,
    imageSmall: `${req.files.imageSmall[0].destination}/${req.files.imageSmall[0].filename}`,
    name: name,
    description: description,
    taste: taste,
    price: price,
    compose: compose,
    status: status,
    category: category,
    series: series
  }
  let dish = new Dish(o)
  Dish.findById(req.params.dishId).exec().then(dish => {
    if (dish) {
      let arr = [dish.imageBig, dish.imageMiddle, dish.imageSmall]
      for (let i = 0, iLen = arr.length; i < iLen; i++) {
        fs.access(arr[i], (err) => {
          // 存在为null，否则为error
          if (err) {
          } else {
            fs.unlinkSync(arr[i], (err) => {
              if (err) {
                throw err
              }
            })
          }
        })
      }
      Dish.findOneAndUpdate({_id: req.params.dishId}, o, {new: true}).exec().then(dish => {
        // console.log(dish)
        if (dish) {
          res.status(200).json({result: true, message: '', data: dish})
        } else {
          res.status(500).json({result: false, message: dish, error: dish})
        }
      }).catch(err => {
        next(err)
      })
    } else {
      res.status(500).json({result: false, message: '更新失败', error: dish})
    }
  }).catch(err => {
    next(err)
  })
  // return
  // Dish.findById(req.params.dishId).exec().then(dish => {
  //   if (dish !== null) {
  //     let {name, description, price} = req.body
  //     dish.name = name
  //     dish.description = description
  //     dish.price = price
  //     dish.save().then(dish => {
  //       res.status(200).json({result: true, message: '', data: dish})
  //     }).catch(err => {
  //       res.status(500).json({result: false, message: '保存数据时出错', error: err})
  //     })
  //   } else {
  //     res.status(404).json({result: false, message: 'do not find.'})
  //   }
  // }).catch(err => {
  //   res.status(500).json({result: false, message: `do not find dishId:${req.params.dishId}`, error: err})
  // })
})
.delete(cors.corsWithOptions, (req, res, next) => {
  Dish.findOne({_id: req.params.dishId}).exec().then(dish => {
    dish.delete = true
    dish.save().then(dish => {
      console.log(dish)
      res.status(200).json({result: true, message: '', data: dish})
    })
  }).catch(err => {
    next(err)
  })
  // 硬删除
  // Dish.findOneAndRemove({_id: req.params.dishId}).exec().then(doc => {
  //   console.log(doc)
  //   res.status(200).json({result: true, message: '', data: doc})
  // }).catch(err => {
  //   next(err)
  // })
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