appControllers.controller('UserCtrl', ['$scope', '$state', '$location', '$window', 'UserService', 'AuthenticationService',
  function AdminUserCtrl($scope, $state, $location, $window, UserService, AuthenticationService) {

    //Admin User Controller (signIn, logOut)
    $scope.signIn = function signIn(username, password) {
      console.log("signIn");
      if (username != null && password != null) {
        //UserService.signIn(username, password).success(function(data) {
        //console.log("Sucesso no login");
        //console.log(data);
        //AuthenticationService.isAuthenticated = true;
        //$window.sessionStorage.token = data.access_token;
        //$location.path("/app/home/");
        //}).error(function(status, data, headers) {
        //console.log("erro");
        //alert(status.error);
        //alert(data);
        //console.log(status);
        //console.log(data);
        //});
        AuthenticationService.isAuthenticated = true;
        $window.sessionStorage.isAuthenticated = true;
        $window.sessionStorage.token = 'FxUzay';
        $scope.message = "Teste";
        $state.go('app.home', {}, {
          reload: true
        });
      }
    }

    //$scope.logOut = function logOut() {
    //console.log("logOut");
    //if (AuthenticationService.isAuthenticated) {

    ////UserService.logOut().success(function(data) {
    ////AuthenticationService.isAuthenticated = false;
    ////delete $window.sessionStorage.token;
    ////$location.path('/login');
    ////}).error(function(status, data) {
    ////console.log(status);
    ////console.log(data);
    ////});
    //AuthenticationService.isAuthenticated = false;
    //$window.sessionStorage.isAuthenticated = false;
    //delete $window.sessionStorage.token;
    //$state.go('login', {}, {
    //reload: true
    //});
    //} else {
    //$state.go('login', {}, {
    //reload: true
    //});
    //}
    //}

    $scope.register = function register(username, password, passwordConfirm) {
      console.log("Register");
      if (AuthenticationService.isAuthenticated) {
        $state.go('app.home', {}, {
          reload: true
        });
      } else {
        UserService.register(username, password, passwordConfirm).success(function(data) {
          $state.go('login', {}, {
            reload: true
          });
        }).error(function(status, data) {
          console.log(status);
          console.log(data);
        });
      }
    }
  }
]);

appControllers.controller('LogoutCtrl', function($state, $window) {
  console.log("Saindo fora")
  AuthenticationService.isAuthenticated = false;
  $window.sessionStorage.isAuthenticated = false;
  delete $window.sessionStorage.token;
  $state.go('login', {}, {
    reload: true
  });
})

appControllers.controller('AppCtrl', function($scope, $ionicModal, $timeout, $location) {
  console.log('AppCtrl');
  //// Form data for the login modal
  //$scope.loginData = {};

  //// Create the login modal that we will use later
  //$ionicModal.fromTemplateUrl('templates/login.html', {
  //scope: $scope
  //}).then(function(modal) {
  //$scope.modal = modal;
  //});

  //// Triggered in the login modal to close it
  //$scope.closeLogin = function() {
  //$scope.modal.hide();
  //};

  //// Open the login modal
  //$scope.login = function() {
  //$scope.modal.show();
  //};

  //// Perform the login action when the user submits the login form
  //$scope.doLogin = function() {
  //if ($scope.loginData.username !== undefined && $scope.loginData.password !== undefined) {
  //UserService
  //}
  //console.log('Doing login', $scope.loginData);

  //// Simulate a login delay. Remove this and replace with your login
  //// code if using a login system
  //$timeout(function() {
  //$scope.closeLogin();
  //}, 1000);
  //};
});

appControllers.controller('HomeCtrl', function($scope, $ionicViewService) {
  $ionicViewService.clearHistory()
  $scope.showLogin = false;
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
});

appControllers.controller('MapCtrl', ['$scope',
  '$cordovaGeolocation',
  '$stateParams',
  '$ionicModal',
  '$ionicPopup',
  '$http',
  '$interval',
  function(
    $scope,
    $cordovaGeolocation,
    $stateParams,
    $ionicModal,
    $ionicPopup,
    $http,
    $interval
  ) {
    console.log('MapCtrl');

    function populateMap() {
      $http.jsonp("http://api.trilhasp.datapublika.com/v1/position/last/?format=jsonp&callback=JSON_CALLBACK")
        .success(function(data) {
          //console.log(current_pos);
          console.log("mostrando pessoas ");
          angular.forEach(data.results, function(person) {
            if ($scope.map.markers[person.id]) {
              if ($scope.map.markers[person.id].timestamp != person.properties.timestamp) {
                // updates person-marker position on the map
                $scope.map.markers[person.id].lat = person.geometry.coordinates[1];
                $scope.map.markers[person.id].lng = person.geometry.coordinates[0];
                $scope.map.markers[person.id].timestamp = person.properties.timestamp;
              }
            } else {
              //add a new person-marker to the map
              $scope.map.markers[person.id] = {};
              //$scope.map.markers[person.id].group = "users";
              $scope.map.markers[person.id].layer = 'users';
              $scope.map.markers[person.id].lat = person.geometry.coordinates[1];
              $scope.map.markers[person.id].lng = person.geometry.coordinates[0];
              $scope.map.markers[person.id].timestamp = person.properties.timestamp;
            }
          });
        })
        .error(function(err, status, headers, config) {
          console.log("não deu certo");
          console.log(status);
          console.log(headers);
          console.log(config);
          console.log(err);
        });
    }

    function autoPopulate() {
      $interval(function() {
        populateMap();
      }, 30000); // Update people position every 30 seconds
    }

    $scope.$on("$stateChangeSuccess", function() {

      $scope.map = {
        markers: {},
        //defaults: {
        //tileLayers: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        //maxZoom: 19,
        //zoomControlPosition: 'topleft'
        //},
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
        },
        layers: {
          baselayers: {
            osm: {
              name: "Open Street Maps",
              type: "xyz",
              url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
              layerOptions: {
                subdomains: ['a', 'b', 'c'],
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                continuousWorld: true,
                maxZoom: 19,
                zoomControlePosition: 'topleft'
              }
            }
          },
          overlays: {
            users: {
              name: "users",
              type: "markercluster",
              visible: true,
              layerOptions: {
                showCoverageOnHover: false,
                iconCreateFunction: function(cluster) {
                  //Refs:
                  //http://stackoverflow.com/questions/25557220/how-to-customize-markercluster-icon-when-using-angular-leaflet-directive
                  //http://esri.github.io/esri-leaflet/examples/styling-clusters.html

                  // get the number of items in the cluster
                  var count = cluster.getChildCount();

                  // figure out how many digits long the number is
                  var digits = (count + '').length;

                  // return a new L.DivIcon with our classes so we can
                  // style them with CSS. Take a look at the CSS in
                  // the <head> to see these styles. You have to set
                  // iconSize to null if you want to use CSS to set the
                  // width and height.
                  return new L.DivIcon({
                    html: count,
                    className: 'cluster digits-' + digits,
                    iconSize: null
                  });

                }
              }
            }
          }
        }
      });

      populateMap();
      autoPopulate();

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
        //var current_pos = $scope.map.center.lng + "_" + $scope.map.center.lat;
        $scope.map.markers = populateMap();
        //$http.jsonp("http://api.trilhasp.datapublika.com/v1/position/last/?format=jsonp&callback=JSON_CALLBACK")
        //.success(function(data) {
        ////console.log(current_pos);
        //var people = $scope.map.markers;
        //console.log("mostrando pessoas");
        //angular.forEach(data.results, function(person) {
        //if (!($scope.map.markers[person.id] && $scope.map.markers[person.id].timestamp == person.properties.timestap)) {
        //people[person.id] = {
        //lat: person.geometry.coordinates[1],
        //lng: person.geometry.coordinates[0],
        //timestamp: person.properties.timestamp
        //};
        //} else {
        //console.log("Já está sendo exibido");
        //}
        //});
        //$scope.map.markers = people;
        //})
        //.error(function(err, status, headers, config) {
        //console.log("não deu certo");
        //console.log(status);
        //console.log(headers);
        //console.log(config);
        //console.log(err);
        //});
      }

      //$scope.goTo(0);
    });
  }
]);
