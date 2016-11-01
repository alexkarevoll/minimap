angular.module('myApp')
  .controller('mainController', mainController)
  .controller('loginController', loginController)
  .controller('logoutController', logoutController)
  .controller('registerController', registerController)
  .controller('postController', postController)


  mainController.$inject = ['$rootScope', '$state', 'AuthService']
  loginController.$inject = ['$http', '$state', 'AuthService', 'NgMap']
  logoutController.$inject = ['$state', 'AuthService']
  registerController.$inject = ['$state', 'AuthService']
  postController.$inject = ['$http', 'AuthService']


function mainController($rootScope, $state, AuthService) {
  var vm = this
  $rootScope.$on('$stateChangeStart', function (event) {
    // console.log("Changing states")
    AuthService.getUserStatus()
      .then(function(data){
        vm.currentUser = data.data.user
      })
  })
}

// LOGIN CONTROLLER:
function loginController($http, $state, AuthService, NgMap) {
  var vm = this

  // MAP STUFF ----------------------------------------------
  // get json object full of events from api
  // for the map to use
  var data = {} // only here so it doesn't break
  $http.get('api/events', data)
    .then(function(data){

      vm.eventLocations = data

      NgMap.getMap().then(function(map) {
        console.log('map', map)
        vm.map = map
      })

      vm.clicked = function() {
        alert('Clicked a link inside infoWindow')
      }

      vm.eventLocation = vm.eventLocations[0]

      vm.showDetail = function(e, eventLocation) {
        vm.eventLocation = eventLocation;
        vm.map.showInfoWindow('event-iw', eventLocation._id);
      }

      vm.hideDetail = function() {
        vm.map.hideInfoWindow('event-iw');
      }

    })

  // login functionality ------------------------------------
  vm.login = function () {

    // initial values
    vm.error = false
    vm.disabled = true

    // call login from service
    AuthService.login(vm.loginForm.username, vm.loginForm.password)
      // handle success
      .then(function () {
        console.log("Successful login...")
        $state.go('profile')
        vm.disabled = false
        vm.loginForm = {}
      })
      // handle error
      .catch(function () {
        console.log("Whoops...")
        vm.error = true
        vm.errorMessage = "Invalid username and/or password"
        vm.disabled = false
        vm.loginForm = {}
      })
  }
}


// LOGOUT CONTROLLER:
function logoutController($state, AuthService) {
  var vm = this
  vm.logout = function () {

    // call logout from service
    AuthService.logout()
      .then(function () {
        $state.go('login')
      })
  }
}

// REGISTER CONTROLLER:
function registerController($state, AuthService) {
  var vm = this
  vm.register = function () {

    // initial values
    vm.error = false
    vm.disabled = true

    // call register from service
    AuthService.register(vm.registerForm.username, vm.registerForm.password)
      // handle success
      .then(function () {
        $state.go('profile')
        vm.disabled = false
        vm.registerForm = {}
      })
      // handle error
      .catch(function () {
        vm.error = true
        vm.errorMessage = "Something went wrong!"
        vm.disabled = false
        vm.registerForm = {}
      })
  }
}

// POST CONTROLLER:

function postController($http, AuthService){
  var vm = this
  vm.title = "Post Controller Is Here"
  vm.currentUser = {}
  vm.currentUser.events = []
  AuthService.getUserStatus()
    .then(function(data){
      vm.currentUser = data.data.user
      $http.get('/api/myevents')
        .then(function(data){
          vm.currentUser.events = data.data
          console.log(data.data)
        })
    })

  vm.addEvent = function() {
    var newEvent = {
      by_ : vm.currentUser,
      address: vm.newEvent.address,
      name: vm.newEvent.name
    }
    console.log("The newEvent in controller.js");
    console.log(newEvent)
    $http.post('/api/events', newEvent)
      .success(function(data){
        console.log("Here is the .success data in postController.addEvent.success")
        console.log(data)
        vm.currentUser.events.push(data)
      })
  }
}
