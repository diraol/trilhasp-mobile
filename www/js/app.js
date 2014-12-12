// Ionic Trilhasp App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'trilhasp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'trilhasp' is found in controllers.js
var app = angular.module('trilhasp', ['ionic', 'leaflet-directive', 'ngCordova', 'ngResource', 'ngCookies', 'trilhasp.services', 'trilhasp.controllers']);

var appControllers = angular.module('trilhasp.controllers', []);
var appServices = angular.module('trilhasp.services', []);

var options = {};
options.api = {};
options.api.auth = {}
options.api.base_url = "http://api.trilhasp.datapublika.com/v1/";
options.api.auth.base_url = "http://api.trilhasp.datapublika.com/";
options.api.auth.client_id = "a";
options.api.auth.client_secret = "a";

app.config(['$stateProvider',
  '$locationProvider',
  '$httpProvider',
  '$urlRouterProvider',
  function(
    $stateProvider,
    $locationProvider,
    $httpProvider,
    $urlRouterProvider) {

    $stateProvider

      .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl',
    })

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'UserCtrl'
    })

    .state('logout', {
        url: '/logout',
        views: {
            controller: 'LogoutCtrl'
        }
    })

    .state('app.avaliacao', {
      url: "/avaliacao",
      views: {
        'menuContent': {
          templateUrl: "templates/avaliacao.html",
          controller: 'AvCtrl',
        }
      }
    })

    .state('app.avaliacao.geral', {
      url: '/avaliacao/geral',
      views: {
        'menuContent': {
          templateUrl: 'templates/avaliacao_geral.html',
          controller: 'AvGeralCtrl',
        }
      },
      parent: 'app.avaliacao'
    })

    .state('app.avaliacao.especifica', {
      url: '/avaliacao/especifica',
      views: {
        'menuContent': {
          templateUrl: 'templates/avaliacao_especifica.html',
          controller: 'AvEspecificaCtrl',
        }
      },
      parent: 'app.avaliacao.geral'
    })

    .state('app.map', {
      url: "/map",
      views: {
        'menuContent': {
          templateUrl: "templates/map.html",
        }
      },
      controller: 'MapCtrl',
    })

    .state('app.game', {
      url: "/game",
      views: {
        'menuContent': {
          templateUrl: "templates/game.html",
          controller: 'GameCtrl',
        }
      }
    })

    .state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/main.html',
          controller: 'HomeCtrl',
        }
      }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
  }
]);

app.config(function($httpProvider) {
  //AUTH
  //$httpProvider.defaults.headers.post['Access-Control-Max-Age'] = '1728000';

  delete $httpProvider.defaults.headers.post['X-Requested-With'];
  $httpProvider.defaults.withCredentials = true;
  $httpProvider.defaults.useXDomain = true;
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.headers.post['Accept'] = 'application/json, text/javascript';
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
  $httpProvider.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
  //$httpProvider.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest';
  //$httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function($ionicPlatform, $rootScope, $location, $window, AuthenticationService, $http, $cookies) {
  $ionicPlatform.ready(function() {
    //if ($window.sessionStorage.token) {
    //$http.defaults.headers.post['X-CSRFToken'] = $window.sessionStorage.token; //$cookies['csrftoken'];
    //}
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
      if (nextRoute != null &&
        !$window.sessionStorage.isAuthenticated && !$window.sessionStorage.token) {
        //redirect only if both isAuthenticated is false and no token is set
        $event.preventDefault();
        $location.path('app.login');
      } else if (nextRoute == 'app.avaliacao.geral' && currentRoute != 'app.avaliacao') {
        $state.go('app.avaliacao');
      } else if (nextRoute == 'app.avaliacao.especifica' && currentRoute != 'app.avaliacao.geral') {
        $state.go('app.avaliacao');
      }
    });

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      //window.cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    // Enable background mode
    //cordova.plugins.backgroundMode.enable();
    // Android customization
    //cordova.plugins.backgroundMode.configure({
    //title: "#TrilhaSP",
    //ticker: "#TrilhaSP rodando em segundo plano",
    //text: "Rodando em segundo plano. Clique para ativar."
    //});

  });
});
