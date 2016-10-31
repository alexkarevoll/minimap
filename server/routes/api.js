var express = require('express')
var router = express.Router()
var passport = require('passport')
var User = require('../models/User.js')
var Event = require('../models/Event.js')

router.post('/register', function(req, res) {
  User.register(new User({ username: req.body.username }),
    req.body.password, function(err, account) {
    if (err) {
      return res.status(500).json({
        err: err
      })
    }
    passport.authenticate('local')(req, res, function () {
      return res.status(200).json({
        status: 'Registration successful!'
      })
    })
  })
})

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.status(401).json({
        err: info
      })
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        })
      }
      res.status(200).json({
        status: 'Login successful!',
        user: user
      })
    })
  })(req, res, next)
})

router.get('/logout', function(req, res) {
  req.logout()
  res.status(200).json({
    status: 'Bye!'
  })
})

router.get('/status', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      status: false
    })
  }
  res.status(200).json({
    status: true,
    user: req.user
  })
})

// EVENTS

router.get('/events', function(req, res){
  // need to find it by the user
  Event.find({}, function(err, data){
    if(err) return console.log(err)
    res.json(data)
  })
})

router.post('/events', function(req, res){
  // need to find it by the user
  User.findById(req.user._id, function(err, user){
    if (err) return console.log(err)
    var newEvent = new Event(req.body)
    newEvent.by_ = user
    newEvent.save(function(err, event){
      user.events.push(event)
      user.save(function(err, user){
        res.json(event)
      })
    })
  })
})

module.exports = router
