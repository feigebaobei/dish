var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var config = require('./config')
var passport = require('passport')
var cors = require('./routes/cors')

// 引入路由
var index = require('./routes/index');
var users = require('./routes/users');
var dish = require('./routes/dish');
var order = require('./routes/order')

// 连接数据库
const url = config.mongoUrl
const connect = mongoose.connect(url, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false})
connect.then(db => {
  console.log('Connect correct to server')
}).catch(err => {console.log(err)})

var app = express();

app.all('*', (req, res, next) => {
  if (req.secure) {
    return next()
  } else {
    res.redirect(307, `https://${req.hostname}:${app.get('secPort')}${req.url}`)
  }
})

app.use(passport.initialize())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// 允许跨域访问静态资源
app.use(cors.corsWithOptions, express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/dish', dish);
app.use('/order', order);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
