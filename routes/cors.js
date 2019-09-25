var cors = require('cors')

var whiteList = ['http://localhost:3000', 'https://localhost:3443', 'https://localhost:8080', 'http://localhost:8080', 'https://192.168.1.6:8080', 'http://192.168.1.6:8080']
var corsOptionDelegate = (req, cb) => {
  var corsOptions
  if (whiteList.indexOf(req.header('Origin')) !== -1) {
    corsOptions = {
      origin: true,
      optionsSuccessStatus: 200,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      allowdHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Content-Type', 'X-Content-Range']
    }
  } else {
    corsOptions = {origin: false}
  }
  cb(null, corsOptions)
}

module.exports = {
  cors: cors(),
  corsWithOptions: cors(corsOptionDelegate)
}