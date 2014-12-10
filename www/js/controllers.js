angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [{
    title: 'Reggae',
    id: 1
  }, {
    title: 'Chill',
    id: 2
  }, {
    title: 'Dubstep',
    id: 3
  }, {
    title: 'Indie',
    id: 4
  }, {
    title: 'Rap',
    id: 5
  }, {
    title: 'Cowbell',
    id: 6
  }];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {})

.controller('HomeCtrl', function($scope) {
  $scope.items = [{
    title: 'Avaliação',
    url: 'avaliacao',
    logo: 'ion-compose'
  }, {
    title: 'Mapa',
    url: 'map',
    logo: 'ion-map'
  }, {
    title: 'Game',
    url: 'game',
    logo: 'ion-android-bus'
  }, ]
})

.factory('OnlineUsers', ['$resource',
  '$http',
  function(
    $resource,
    $http) {
    $http.defaults.useXDomain = true;
    return $resource('http://api.trilhasp.datapublika.com/v1/position/last/users/-46.6850309_-23.5513759/'), {}, {
      fetch: {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    }
  }
])

.controller('MapCtrl', ['$scope',
  '$cordovaGeolocation',
  '$stateParams',
  '$ionicModal',
  '$ionicPopup',
  'LocationsService',
  '$http',
  function(
    $scope,
    $cordovaGeolocation,
    $stateParams,
    $ionicModal,
    $ionicPopup,
    LocationsService,
    $http
  ) {
    $scope.$on("$stateChangeSuccess", function() {

      $scope.locations = LocationsService.savedLocations;
      $scope.newLocation;

      $scope.map = {
        defaults: {
          tileLayers: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
          maxZoom: 19,
          zoomControlPosition: 'bottomleft'
        },
        markers: {
          // TODO: Request Points from API.
        },
        events: {
          map: {
            enable: ['context'],
            logic: 'emit'
          }
        }
      };

      angular.extend($scope.map, {
        center: {
          autoDiscover: true,
          // São Paulo
          //lat: -23.565009,
          //lng: -46.653125,
          zoom: 18
        }
      });

      //$scope.map.addMarker = function(marker) {
      //angular.extend($scope.map, {
      //markers: {
      //m1: {
      //lat: 51.505,
      //lng: -0.09,
      //message: "I'm a static marker",
      //},
      //m2: {
      //lat: 51,
      //lng: 0,
      //focus: true,
      //message: "<div ng-include src=\"'views/template.html'\"></div>",
      //draggable: true,
      //}
      //}
      //});
      //};

      $scope.showusers = function() {
        var current_pos = $scope.map.center.lng + "_" + $scope.map.center.lat;
        $http.get("http://api.trilhasp.datapublika.com/v1/position/last/users/" + current_pos + "/", {
            format: 'json'
          })
          .success(function(data) {
            var people = $scope.map.markers;
            console.log(people);
            angular.forEach(data.results, function(person) {
              if (!($scope.map.markers[person.id] && $scope.map.markers[person.id].timestamp == person.properties.timestap)) {
                people[person.id] = {
                  lat: person.geometry.coordinates[1],
                  lng: person.geometry.coordinates[0],
                  timestamp: person.properties.timestamp
                };
              } else {
                console.log("Já está sendo exibido");
              }
            });
            $scope.map.markers = people;
          })
          .error(function(err, status, headers, config) {
            console.log(status);
            console.log(headers);
            console.log(config);
            console.log(err);
          });
      }

      //$scope.goTo(0);
    });

  }
]);
