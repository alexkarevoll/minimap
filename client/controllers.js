angular.module('myApp')
  .controller('mainController', mainController)
  .controller('loginController', loginController)
  .controller('logoutController', logoutController)
  .controller('registerController', registerController)
  .controller('postController', postController)


  mainController.$inject = ['$rootScope', '$state', 'AuthService']
  loginController.$inject = ['$http', '$state', 'AuthService', 'NgMap', '$uibModal', '$log', '$document', '$rootScope']
  logoutController.$inject = ['$state', 'AuthService']
  registerController.$inject = ['$state', 'AuthService']
  postController.$inject = ['$http', 'AuthService']

// MAIN CONTROLLER: ========================================
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

// LOGIN CONTROLLER: ========================================
function loginController($http, $state, AuthService, NgMap, $uibModal, $log, $document, $rootScope) {
  var vm = this


  // MAP STUFF ----------------------------------------------

  NgMap.getMap().then(function(map) {
    console.log('map', map)
    vm.map = map
  })

  var data = {} // only here so it doesn't break
  // vm.eventDetails = { "name": "click a marker for details"}
  $http.get('api/events', data)
    .then(function(data){
      // get all events in json format
      vm.eventLocations = data.data
      // set the selected location to the first location for now
      vm.selectedLocation = vm.eventLocations[0]



  })
  vm.showDetail = function(event, eventLocation) {
    vm.selected = eventLocation._id
    console.log(eventLocation)
    vm.eventDetails = eventLocation
    $rootScope.eventDetails = eventLocation
  }

  // Meetup API STUFF --------------------------------------
  var meetupData = {}
  $http.get('api/meetup', meetupData)
    .then(function(meetupData){
      console.log("someone went to 'api/meetup'!")
      vm.meetupLocations = meetupData.data.results
    })


  // Modal Stuff --------------------------------------------
  vm.animationsEnabled = true;

  vm.modalSelect = $rootScope.eventDetails

  vm.open = function (size, parentSelector) {
    var parentElem = parentSelector ?
      angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
    var modalInstance = $uibModal.open({
      animation: vm.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'myModalContent.html',
      controller: 'loginController',
      controllerAs: 'loginCtrl',
      size: size,
      appendTo: parentElem,
      resolve: {}
    });
    modalInstance.result.then(function (selectedItem) {
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

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
  AuthService.getUserStatus()
    .then(function(data){
      vm.currentUser = data.data.user
    })
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

    // add an event
  vm.addEvent = function() {
    var newEvent = {
      by_ : vm.currentUser,
      address: vm.newEvent.address,
      name: vm.newEvent.name,
      date: vm.newEvent.date,
      description: vm.newEvent.description
    }
    console.log("The newEvent in controller.js");
    console.log(newEvent)
    $http.post('/api/events', newEvent)
      .success(function(data){
        console.log("Here is the .success data in postController.addEvent.success")
        console.log(data)
        vm.currentUser.events.push(data)
        vm.newEvent = {}
      })
  }
  // delete an event
  vm.deleteEvent = function() {
    $http.delete('/api/myevents')
  }
}
