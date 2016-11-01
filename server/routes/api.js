var express = require('express')
var router = express.Router()
var passport = require('passport')
var geocoder = require('geocoder')
var User = require('../models/User.js')
var Event = require('../models/Event.js')

// AUTHENTICATION ============================================

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

// EVENTS =================================================

// get all events
router.get('/events', function(req, res){
  // res.send('hello from .get /events')
  Event.find({}, function(err, events){
    if(err) return console.log(err)
    console.log("api.js .get /events data")
    console.log(events)
    res.json(events)
  })
})

// get just that user's events
router.get('/myevents', function(req, res){
  User.findById(req.user._id).populate("events").exec(function(err, user){
    res.json(user.events)
  })
})

// post a new event
router.post('/events', function(req, res){
  User.findById(req.user._id, function(err, user){
    if (err) return console.log(err)
    // create a newEvent variable with the data from the controller
    var newEvent = new Event(req.body)
    // set its by property to the currently logged in user
    newEvent.by_ = user._id
    // log whats incoming from the controller
    console.log("Here Comes req.body.location in api.js");
    console.log(req.body.address)
    // run geocoder to take their address and find it's latitude and longitude
    geocoder.geocode(req.body.address, function ( err, data ) {
      console.log("Here is the geocoder data.results[0].geometry.location.lat then lng:")
      // drill into the response for the first objects latitude and longitude
      console.log(data.results[0].geometry.location.lat)
      console.log(data.results[0].geometry.location.lng)
      // then push that location data into the new event object's location property
      // newEvent.location.push(data.results[0].geometry.location.lat)
      // newEvent.location.push(data.results[0].geometry.location.lng)
      newEvent.location = [
        data.results[0].geometry.location.lat,
        data.results[0].geometry.location.lng
      ]

      console.log("Here is newEvent after geocoder gets done with it:")
      console.log(newEvent)
      // then save that newEvent object
      newEvent.save(function(err, event){
        user.events.push(event)
        user.save(function(err, user){
          res.json(event)
        })
      })
    });
  })
  // User.findById(req.user._id, function(err, user){
  //   if (err) return console.log(err)
  //   var newEvent = new Event(req.body)
  //   newEvent.by_ = user
  //   newEvent.save(function(err, event){
  //     user.events.push(event)
  //     user.save(function(err, user){
  //       res.json(event)
  //     })
  //   })
  // })
})

// add an event to your quest log

// EXPORT ======================================================
module.exports = router
