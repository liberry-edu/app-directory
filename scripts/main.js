var mainApp = angular.module("mainApp", ['ui.router', 'LocalStorageModule']);

mainApp.factory("AuthService", function(localStorageService) {
    var authService = {
        authenticate: function(username, password) {
            localStorageService.set('username', username);
            localStorageService.set('password', password);
        },
        isAuthenticated: function() {
            return localStorageService.get('username') !== null;
        },
        getAuthentication: function() {
            var payload = {
                username: localStorageService.get('username'),
                password: localStorageService.get('password')
            }
            return payload;
        }
    }

    return authService;
});

mainApp.factory('httpRequestInterceptor', function (AuthService) {
  return {
    request: function (config) {
        if(AuthService.isAuthenticated()) {
            var authentication = AuthService.getAuthentication();
            var token = window.btoa(authentication.username + ':' + authentication.password);
            config.headers['Authorization'] = 'Basic ' + token;
        }
        return config;
    }
  };
});

mainApp.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  $httpProvider.interceptors.push('httpRequestInterceptor');

  // For any unmatched url, redirect to /login
  $urlRouterProvider.otherwise("/login");

  // Now set up the states
  $stateProvider
    .state('login', {
      url: "/login",
      templateUrl: "views/login.html",
      authenticate: false,
      controller: function($scope, $http, $state, AuthService) {
          if(AuthService.isAuthenticated()) {
              $state.go('home');
          }
          $scope.authenticate = function() {
              var payload = {
                  username: $scope.username,
                  password: 'password'
              }
              var successCallback = function(response) {
                  if(response) {
                      AuthService.authenticate($scope.username, 'password');
                      $state.go('home');
                  }
                  else {
                      $scope.error = "Invalid username and/or password";
                  }
              }
              var errorCallback = function(response) {
                  $scope.error = response.message;
              }
              $http.post('/api/isValidUser', payload).then(successCallback, errorCallback);
          }
      }
  })
  .state('home', {
      url: "/home",
      templateUrl: "views/home.html",
      authenticate: true,
      controller: function($scope, $http, AuthService) {
          if(!AuthService.isAuthenticated()) {
              $state.go('login');
          }
          var successCallback = function(response) {
              $scope.apps = response.data;
          }
          var errorCallback = function(response) {
              $scope.error = "Could not fetch the list of apps";
          }
          $http.get('/api/apps').then(successCallback, errorCallback);
      }
  })
  .state('register', {
      url: "/register",
      templateUrl: "views/register.html",
      authenticate: false,
      controller: function($scope, $http, $state, AuthService) {
          var successCallback = function(response) {
              AuthService.authenticate($scope.username, 'password');
              $state.go('home');
          }
          var errorCallback = function(response) {
              $scope.error = response.message;
          }
          $scope.register = function() {
              var payload = {
                  username: $scope.username,
                  password: 'password',
                  name: $scope.name
              }
              $http.post('/api/register', payload).then(successCallback, errorCallback);
          }
      }
  });
});

mainApp.run(function ($rootScope, $state, AuthService) {
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
      if (toState.authenticate && !AuthService.isAuthenticated()){
        // User isn’t authenticated
        $rootScope.returnToState = toState.url;
        $state.transitionTo("login");
        event.preventDefault();
      }
    });
});
