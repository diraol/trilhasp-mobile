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
  //console.log('AppCtrl');
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
    //console.log('MapCtrl');

    function populateMap() {
      //console.log(current_pos); #TODO
      $http.jsonp("http://api.trilhasp.datapublika.com/v1/position/last/?format=jsonp&callback=JSON_CALLBACK")
        .success(function(data) {
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
        events: {
          map: {
            enable: ['context'],
            logic: 'emit'
          }
        }
      };

      angular.extend($scope.map, {
        SP: {
          lat: -23.565009,
          lng: -46.653125,
          zoom: 18
        },
        center: {
          autoDiscover: true,
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

    });
  }
]);

appControllers.controller('AvCtrl', ['$scope', '$state', '$window', 'QRScanService',
  function($scope, $state, $window, QRScanService) {
    var evaluation = {
      busId: 0,
      general: {
        value: 50,
        text: ''
      },
      specific: {} // This should be populated based on api request
    };
    $scope.click = function() {
      console.log('Scanning...');

      var promise = QRScanService.scan();
      promise.then(function(result) {
          if (!result.error) {
            evaluation.busId = result.result.text;
            $window.sessionStorage.evaluation = JSON.stringify(evaluation);
            $state.go('app.avaliacaogeral', {}, {
              reload: true
            });
            $scope.message = 'ônibus número: ' + result.result.text;
          } else {
            $scope.message = '<b>ERROR</b>: ' + result;
          }
        },
        function(result) {
          $scope.message = '' + result.error;
        },
        function(result) {
          $scope.message = '' + result.error;
        });
      $window.sessionStorage.evaluation = JSON.stringify(evaluation);
      $state.go('app.avaliacaogeral', {}, {
        reload: true
      });
    }
    $scope.clear = function() {
      $scope.message = '';
    }
  }
]);

appControllers.controller('AvGeralCtrl', ['$scope', '$state', '$ionicViewService', '$window',
  function($scope, $state, $ionicViewService, $window) {
    $ionicViewService.clearHistory();
    var evaluation = JSON.parse($window.sessionStorage.evaluation);
    $scope.subTitle = evaluation.busId;
    $scope.avaliacaoTxtHide = true;

    $scope.fullNote = function(avaliacao) {
      if (!avaliacao) {
        $scope.avaliacao = {
          'value': 100,
          'text': ''
        };
        avaliacao = $scope.avaliacao;
      } else {
        avaliacao.value = 100;
      }
      $scope.change(avaliacao);
    };

    $scope.zeroNote = function(avaliacao) {
      if (!avaliacao) {
        $scope.avaliacao = {
          'value': 0,
          'text': ''
        };
        avaliacao = $scope.avaliacao;
      } else {
        avaliacao.value = 0;
      }
      $scope.change(avaliacao);
    };

    $scope.change = function(avaliacao) {
      evaluation.general.value = avaliacao.value;
      evaluation.general.text = avaliacao.txt || '';
      if (avaliacao.value >= 50) {
        $scope.avaliacaoTxtHide = true;
      } else {
        $scope.avaliacaoTxtHide = false;
      }
    };

    function _save(avaliacao) {
    }

    $scope.endEval = function(avaliacao) {
      evaluation.general.value = avaliacao.value;
      if (evaluation.general.value >= 50) {
        evaluation.general.text = '';
      } else {
        evaluation.general.text = avaliacao.text;
      }
      $window.sessionStorage.evaluation = JSON.stringify(evaluation);
      $state.go('app.home', {}, {
        reload: true
      })
    }

    $scope.nextEval = function(avaliacao) {
      evaluation.general.value = avaliacao.value;
      if (evaluation.general.value >= 50) {
        evaluation.general.text = '';
      } else {
        evaluation.general.text = avaliacao.text;
      }
      $window.sessionStorage.evaluation = JSON.stringify(evaluation);
      $state.go('app.avaliacaoespecifica', {}, {
        reload: true
      })
    }
  }
]);

appControllers.controller('AvEspecificaCtrl', ['$scope', '$state', '$ionicViewService', '$ionicLoading', '$http', '$window',
  function($scope, $state, $ionicViewService, $ionicLoading, $http, $window) {
    $ionicViewService.clearHistory()
    var evaluation = JSON.parse($window.sessionStorage.evaluation);
    console.log(evaluation);
    $scope.subTitle = evaluation.busId;

    $ionicLoading.show({
      template: 'loading'
    });
    $scope.spec = {};
    $scope.specTxtHide = {};
    $scope.questions = [];

    $http.jsonp("http://api.trilhasp.datapublika.com/v1/evaluation/question/?format=jsonp&callback=JSON_CALLBACK").then(function(data) {
        $scope.questions = data.data.results;
        console.log(JSON.stringify(data.data.results));
        angular.forEach(data.data.results, function(question) {
          $scope.spec[question.id] = {
            id: question.id,
            question: question.question,
            value: 50,
            text: ''
          };
          evaluation.specific[question.id] = {
            value: 50,
            text: ''
          }
          console.log(JSON.stringify(evaluation));
          $scope.specTxtHide[question.id] = true;
        });
        $ionicLoading.hide();
      },
      function(err, status, headers, config) {
        $scope.message = "Erro ao carregar perguntas";
        $scope.showReload = true;
        $ionicLoading.hide();
      });

    $scope.fullNote = function(questionId) {
      $scope.spec[questionId].value = 100;
      $scope.change(questionId);
    };

    $scope.zeroNote = function(questionId) {
      $scope.spec[questionId].value = 0;
      $scope.change(questionId);
    };

    $scope.change = function(questionId) {
      evaluation.specific[questionId].value = $scope.spec[questionId].value;
      evaluation.specific[questionId].text = $scope.spec[questionId].text;
      if ($scope.spec[questionId].value >= 50) {
        $scope.specTxtHide[questionId] = true;
      } else {
        $scope.specTxtHide[questionId] = false;
      }
    };

    $scope.endEval = function() {
      angular.forEach(evaluation.specific, function(quest, key) {
        if (quest.value >= 50) {
          evaluation.specific[key].text = '';
        }
      })
      $window.sessionStorage.evaluation = JSON.stringify(evaluation);
      console.log($window.sessionStorage.evaluation);
      $state.go('app.home', {}, {
        reload: true
      })
    }
  }
])
