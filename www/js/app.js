// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'leaflet-directive', 'ngCordova', 'ngResource', 'starter.controllers'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
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
  })
  .config(function($stateProvider, $urlRouterProvider, $httpProvider) {
    $stateProvider

      .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state('app.search', {
      url: "/search",
      views: {
        'menuContent': {
          templateUrl: "templates/search.html"
        }
      }
    })

    .state('app.browse', {
        url: "/browse",
        views: {
          'menuContent': {
            templateUrl: "templates/browse.html"
          }
        }
      })
      .state('app.playlists', {
        url: "/playlists",
        views: {
          'menuContent': {
            templateUrl: "templates/playlists.html",
            controller: 'PlaylistsCtrl'
          }
        }
      })

    .state('app.single', {
      url: "/playlists/:playlistId",
      views: {
        'menuContent': {
          templateUrl: "templates/playlist.html",
          controller: 'PlaylistCtrl'
        }
      }
    })

    .state('app.map', {
      url: "/map",
      views: {
        'menuContent': {
          templateUrl: "templates/map.html",
          controller: 'MapCtrl'
        }
      }
    })

    .state('app.avaliacao', {
      url: "/avaliacao",
      views: {
        'menuContent': {
          templateUrl: "templates/avaliacao.html",
          controller: 'AvCtrl'
        }
      }
    })

    .state('app.game', {
      url: "/game",
      views: {
        'menuContent': {
          templateUrl: "templates/game.html",
          controller: 'GameCtrl'
        }
      }
    })

    .state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/main.html',
          controller: 'HomeCtrl'
        }
      }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');

    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.defaults.headers.post['Accept'] = 'application/json, text/javascript';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
    $httpProvider.defaults.headers.post['Access-Control-Max-Age'] = '1728000';
    $httpProvider.defaults.useXDomain = true;

  });
