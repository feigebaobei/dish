let express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  Dish = require('../models/dish'),
  authenticate = require('../authenticate'),
  cors = require('./cors'),
  multer = require('multer'),
  config = require('../config'),
  fs = require('fs'),
  util = require('../util')
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
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  let {name, delete: delStatus, taste, page, size} = req.query
  taste = taste || []
  let filter = {
    // delete: {$not: {$eq: true}}
  }
  // get请求中查询字符串中得到的都是string。
  switch (delStatus) {
    case 'true':
      filter.delete = {$eq: true}
      break
    case 'false':
      filter.delete = {$eq: false}
      break
    default:
      break
  }
  // if (delStatus === 'true') {
  //   filter.delete = {$eq: true}
  // } else {
  //   // filter.delete = {$eq: false}
  // }
  if (name) {
    filter.name = new RegExp(name, 'i')
  }
  if (taste.length) {
    filter.taste = {$in: taste.map((item) => {
      return Number(item)
    })}
  }
  console.log(filter)
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
  Dish.findById(dishId, '-comments').exec().then(dish => {
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
  let {name, description, taste, price, compose, status, delete: delStatus, category, series} = req.body
  // console.log(req.files)
  console.log(req.body)
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
    delete: delStatus,
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
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
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

router.route('/:dishId/comment')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  let {page, size, user} = req.query
  let stages = []
  page = util.range(Number(page || 0), 0, 100)
  size = util.range(Number(size || 0), 0, 200)
  switch (user) {
    case 'all':
    default:
      let setOptions = {
        skip: page * size,
        limit: size
      }
      Dish.findById(req.params.dishId, 'comments', setOptions).populate('Dish.comments').then(comments => {
        res.status(200).json({result: true, message: '', data: comments})
      }).catch(err => {
        next(err)
      })
      break
    case 'current':
      stages = [
        {$match: {_id: mongoose.Types.ObjectId(req.params.dishId)}},
        {
          $project: {comments: 1, _id: 0}
        },
        {
          $unwind: '$comments'
        },
        {
          $match: {'comments.author': req.user._id}
        }
      ]
      if (page && size) {
        stages.push({
          $skip: page * size
        }, {
          $limit: size
        })
      }
      stages.push({
        $lookup: {
          // from: 'user', // no
          from: 'users',
          localField: 'comments.author',
          foreignField: '_id',
          as: 'comments.author'
        }
      }, {
        $project: {
          // 'comments.author': 0,
          'comments.author.hash': 0,
          'comments.author.salt': 0,
          'comments.author.__v': 0,
          'comments.author._id': 0
        }
      })
      Dish.aggregate(stages).then(comments => {
        res.status(200).json({result: true, message: '', data: comments})
      }).catch(err => next(err))
      break
    case 'other':
      stages = [
        {$match: {_id: mongoose.Types.ObjectId(req.params.dishId)}},
        {
          $project: {comments: 1, _id: 0}
        },
        {
          $unwind: '$comments'
        },
        {
          $match: {'comments.author': {$not: {$eq: req.user._id}}}
        }
      ]
      if (page && size) {
        stages.push({
          $skip: page * size
        }, {
          $limit: size
        })
      }
      stages.push({
        $lookup: {
          from: 'users',
          localField: 'comments.author',
          foreignField: '_id',
          as: 'comments.author'
        }
      }, {
        // 这个comments.auther应该删除
        $project: {
          // 'comments.author': 0,
          'comments.author.hash': 0,
          'comments.author.salt': 0,
          'comments.author.__v': 0,
          'comments.author._id': 0
        }
      })
      Dish.aggregate(stages).then(comments => {
        res.status(200).json({result: true, message: '', data: comments})
      }).catch(err => next(err))
      break
  }
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Dish.findById(req.params.dishId).then(dish => {
    if (dish !== null) {
      let currentComment = {
        videoRating: req.body.videoRating,
        odourRating: req.body.odourRating,
        tasteRating: req.body.tasteRating,
        content: req.body.content,
        author: req.user._id
      }
      dish.comments.push(currentComment)
      dish.save().then(dish => {
        res.status(200).json({result: true, message: '', data: dish})
      }).catch(err => next(err))
    } else {
      let err = new Error(`Dish ${req.params.dishId} not found`)
      err.status = 404
      return next(err)
    }
  }).catch(err => {
    next(err)
  })
})
.put((req, res, next) => {
  res.send('put')
})
.delete((req, res, next) => {
  res.send('delete')
})

router.route('/:dishId/comment/:commentId')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.get((req, res, next) => {
  res.send('get')
})
.post((req, res, next) => {
  res.send('post')
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Dish.findById(req.params.dishId).then(dish => {
    if (dish != null && dish.comments.id(req.params.commentId)) {
      // 是否是评论的作者
      if (dish.comments.id(req.params.commentId).author.toString() == req.user._id) {
        if (req.body.videoRating) {
          dish.comments.id(req.params.commentId).videoRating = req.body.videoRating
        }
        if (req.body.odourRating) {
          dish.comments.id(req.params.commentId).odourRating = req.body.odourRating
        }
        if (req.body.tasteRating) {
          dish.comments.id(req.params.commentId).tasteRating = req.body.tasteRating
        }
        if (req.body.content) {
          dish.comments.id(req.params.commentId).content = req.body.content
        }
        dish.save().then(dish => {
          res.status(200).json({result: true, message: '', data: dish})
        })
      } else {
        res.status(403).json({result: true, message: '你不是评论的作者', data: {}})
      }
    } else {
      if (dish === null) {
        next(new Error(`Dish ${req.params.dishId} not found`).status = 404)
      } else {
        next(new Error(`Comment ${req.params.commentId} not found`).status = 404)
      }
    }
  }).catch(err => next(err))
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  res.send('delete')
})

// router.route('/:dishId/commentCurrentUser') // 查询当前用户的评论
// .options(cors.corsWithOptions, (req, res) => {
//   res.sendStatus(200)
// })
// .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
//   Dish.aggregate(
//     [
//       {$match: {_id: mongoose.Types.ObjectId(req.params.dishId)}},
//       {
//         $project: {comments: 1, _id: 0}
//       },
//       {
//         $unwind: '$comments'
//       },
//       {
//         $match: {'comments.author': req.user._id}
//       }
//     ]
//   ).then(comments => {
//     res.status(200).json({result: true, message: '', data: comments})
//   }).catch(err => next(err))
// })

// router.route('/:dishId/commentOtherUser') // 查询非当前用户的评论
// .options(cors.corsWithOptions, (req, res) => {
//   res.sendStatus(200)
// })
// .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
//   Dish.aggregate(
//     [
//       {$match: {_id: mongoose.Types.ObjectId(req.params.dishId)}},
//       {
//         $project: {comments: 1, _id: 0}
//       },
//       {
//         $unwind: '$comments'
//       },
//       {
//         $match: {'comments.author': {$not: {$eq: req.user._id}}}
//       }
//     ]
//   ).then(comments => {
//     res.status(200).json({result: true, message: '', data: comments})
//   }).catch(err => next(err))
// })

module.exports = router