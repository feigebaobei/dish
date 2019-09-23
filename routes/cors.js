var cors = require('cors')

var whiteList = ['http://localhost:3000', 'https://localhost:3443']
var corsOptionDelegate = (req, cb) => {
  var corsOptions
  if (whiteList.indexOf(req.header('Origin')) !== -1) {
    corsOptions = {origin: true}
  } else {
    corsOptions = {origin: false}
  }
  cb(null, corsOptions)
}

module.exports = {
  cors: cors(),
  corsWithOptions: cors(corsOptionDelegate)
}