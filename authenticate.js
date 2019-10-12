let passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = require('./models/user')

let {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt'),
  jwt = require('jsonwebtoken')

let config = require('./config')

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

let fromCookieExtractor = (req) => {
  let token = null
  if (req && req.cookies) {
    token = req.cookies['token']
  }
  return token
}
var options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // jwtFromRequest: fromCookieExtractor,
  secretOrKey: config.secretKey
}

exports.getToken = (user) => jwt.sign(user, config.secretKey, {expiresIn: 18000})
exports.jwtPassport = passport.use(new JwtStrategy(options, (jwt_payload, done) => {
  User.findOne({_id: jwt_payload._id}, (err, user) => {
    if (err) {
      return done(err, null)
    } else {
      if (user) {
        return done(null, user)
      } else {
        return done(null, false)
      }
    }
  })
}))
exports.verifyUser = passport.authenticate('jwt', {
  session: false
  // failureRedirect: '/error/auth'
})
exports.verifyAdmin = (req, res, next) => {
  if (req.user.admin) {
    next()
  } else {
    res.status(403).send('not admin')
  }
}