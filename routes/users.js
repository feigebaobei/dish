var express = require('express');
var router = express.Router();
var User = require('../models/user')
var passport = require('passport')
var bodyParser = require('body-parser')
var multer = require('multer')
// var multipart = require('connect-multiparty')
// var multer = require('multer')
var authenticate = require('../authenticate')
var cors = require('./cors')
var util = require('../util')

// var mulitpartMiddleware = multipart()
// var upload = multer({dest: __dirname+'/public/images'})
router.use(bodyParser.json())
// router.use(bodyParser.urlencoded({extended: true}))
router.use(bodyParser.urlencoded({ extended: false }))

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


/* GET users listing. */
router.route('/')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  let filter = {}
  let {page, size, username} = req.query
  if (username) {
    filter.username = new RegExp(username, 'i')
  }
  page = util.range(Number(page || 0), 0, 100)
  size = util.range(Number(size || 0), 0, 200)
  let setOptions = {
    skip: page * size,
    limit: size
  }
  User.count(filter).then((count) => {
    User.find(filter, '-__v, -salt, -hash', setOptions).then(users => {
      res.status(200).json({
        result: true,
        message: '',
        data: {
          users: users,
          amount: count
        }
      })
    }).catch(err => {
      next(err)
    })
  })
})
.post((req, res, next) => {
  res.send('root post')
})
.put((req, res, next) => {
  res.send('root put')
})
.delete((req, res, next) => {
  res.send('root delete')
})

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

router.route('/isLogin')
.options(cors.corsWithOptions, (req, res) => {
  console.log(req.origin)
  res.sendStatus(200)
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  // let token = res.cookies.token
  // console.log(req, res)
  // res.send('string')
  res.status(200).json({result: true, data: {}, message: 'You had logged in!'})
})

router.route('/login')
.options(cors.corsWithOptions, (req, res) => {
  // console.log(req.origin)
  res.sendStatus(200)
})
.post(cors.corsWithOptions, passport.authenticate('local'), (req, res, next) => {
  let token = authenticate.getToken({_id: req.user._id})
  User.findById(req.user._id, 'username').then(user => {
    res.setHeader('Content-Type', 'application/json')
    res.status(200).json({result: true, data: {
      token: token,
      user: { // 后期可能增加其他数据
        username: user.username
      }
    }, message: 'You are successful logged in!'})
    
  })
  // res.cookie('token', token, {httpOnly: true})
})

router.post('/logout', (req, res, next) => {
  res.status(200).json({result: true, message: '登出功能在前端做', data: {}})
  // if (req.cookies.token) {
  //   res.cookie('token', null, {httpOnly: true, expires: new Date()})
  //   res.setHeader('Content-Type', 'application/json')
  //   res.status(200).json({result: true, message: 'logout success.'})
  // } else {
  //   res.status(403).json({result: false, message: ''})
  // }
})

router.route('/:userId')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})
.get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.findById(req.params.userId).then(user => {
    res.status(200).json({result: true, message: '', data: user})
  }).catch(err => next(err))
})
.post((req, res, next) => {
  res.send('post')
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.fields([
    // {name: ''}
  ]), (req, res, next) => {
  // 修改指定的一条数据并返回修改后的数据
  // console.log(req.body)
  // User.findOneAndUpdate({_id: req.params.userId}, {
  User.findByIdAndUpdate(req.params.userId, {
  // User.updateOne({_id: req.params.userId}, {
    username: req.body.username.toString().slice(0, 20), // 名字最长20
    admin: req.body.admin === 'true'
  }, {
    new: true // 返回修改后的数据。默认为false
  }).then(user => {
    res.status(200).json({result: true, message: '', data: user})
  }).catch(err => next(err))
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.deleteOne({_id: req.params.userId}).then(user => {
    res.status(200).json({result: true, message: '', data: user})
  }).catch(err => next(err))
})

module.exports = router;
