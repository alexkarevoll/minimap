angular.module('myApp')
  .controller('mainController', mainController)
  .controller('loginController', loginController)
  .controller('logoutController', logoutController)
  .controller('registerController', registerController)
  .controller('postController', postController)
  .controller('eventController', eventController)


  mainController.$inject = ['$rootScope', '$state', 'AuthService', 'gservice']
  loginController.$inject = ['$state', 'AuthService']
  logoutController.$inject = ['$state', 'AuthService']
  registerController.$inject = ['$state', 'AuthService']
  postController.$inject = ['$http', 'AuthService', 'gservice']
  eventController.$inject = ['$http', '$scope', '$rootScope', 'gservice']


function mainController($rootScope, $state, AuthService, gservice) {
  var vm = this
  console.log(gservice)
  $rootScope.$on('$stateChangeStart', function (event) {
    // console.log("Changing states")
    AuthService.getUserStatus()
      .then(function(data){
        vm.currentUser = data.data.user
      })
  })
}

// LOGIN CONTROLLER:
function loginController($state, AuthService) {
  var vm = this
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

function postController($http, AuthService, gservice){
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
      location: [vm.newEvent.latitude, vm.newEvent.longitude],
      name: vm.newEvent.name
    }
    $http.post('/api/events', newEvent)
      .success(function(data){
        console.log(data)
        vm.currentUser.events.push(data)
      })
  }
}

function eventController($http, $scope, $rootScope, gservice){

    vm = this

    vm.formData = {}
    var coords = {}
    var lat = 0
    var long = 0

    vm.formData.latitude = 39.500
    vm.formData.longitude = -98.350

  //   // Get User's actual coordinates based on HTML5 at window load
  //   geolocation.getLocation().then(function(data){
  //
  //     // Set the latitude and longitude equal to the HTML5 coordinates
  //     coords = {lat:data.coords.latitude, long:data.coords.longitude};
  //
  //     // Display coordinates in location textboxes rounded to three decimal points
  //     vm.formData.longitude = parseFloat(coords.long).toFixed(3);
  //     vm.formData.latitude = parseFloat(coords.lat).toFixed(3);
  //
  //     // Display message confirming that the coordinates verified.
  //     vm.formData.htmlverified = "Yep (Thanks for giving us real data!)";
  //
  //     gservice.refresh(vm.formData.latitude, vm.formData.longitude);
  //
  // });

    // Get coordinates based on mouse click. When a click event is detected....
    $rootScope.$on("clicked", function(){

      // Run the gservice functions associated with identifying coordinates
      $scope.$apply(function(){
          vm.formData.latitude = parseFloat(gservice.clickLat).toFixed(3)
          vm.formData.longitude = parseFloat(gservice.clickLong).toFixed(3)
      })
  })

    vm.createUser = function() {

      var userData = {
        username: vm.formData.username,
        gender: vm.formData.gender,
        age: vm.formData.age,
        favlang: vm.formData.favlang,
        location: [vm.formData.longitude, vm.formData.latitude],
        htmlverified: vm.formData.htmlverified
      }

      $http.post('/users', userData)
        .success(function (data) {
          vm.formData.username = ""
          vm.formData.gender = ""
          vm.formData.age = ""
          vm.formData.favlang = ""
          // refresh the map with the new data
          gservice.refresh(vm.formData.latitude, vm.formData.longitude)
        })
        .error(function(data) {
          console.log("Error: " + data);
        })
    }
  }
