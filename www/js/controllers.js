appControllers.controller('UserCtrl', ['$scope', '$state', '$http', '$window',
  function AdminUserCtrl($scope, $state, $http, $window) {

    $scope.user = {
      username: 'a',
      password: 'a',
      grant_type: 'password'
    };
    $scope.isAuthenticated = false;
    $scope.welcome = '';
    $scope.message = '';

    if ($scope.isAuthenticated) {
      $state.go('app.home', {}, {
        reload: true
      });
    }

    $scope.submit = function() {
      $http({
          url: options.api.auth.base_url,
          method: 'POST',
          data: JSON.stringify($scope.user),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          }
        })
        .success(function(data, status, headers, config) {
          $window.sessionStorage.token = data.access_token;
          $scope.isAuthenticated = true;
          console.log("Authenticated");
          $state.go('app.home', {}, {
            reload: true
          });
        })
        .error(function(data, status, headers, config) {
          delete $window.sessionStorage.token;
          $scope.isAuthenticated = false;
          console.log('\n\n--------------------------------------');
          console.log(JSON.stringify(data));
          console.log('\n\n--------------------------------------');
          console.log(status);
          console.log('\n\n--------------------------------------');
          console.log(JSON.stringify(headers));
          console.log('\n\n--------------------------------------');
          console.log(JSON.stringify(config));
          console.log(config.data.username);
          console.log('\n\n--------------------------------------');
          console.log("Erro no login");
        });
    };

    $scope.logout = function() {
      $scope.isAuthenticated = false;
      delete $window.sessionStorage.token;
      console.log("logout");
      $state.go('login', {}, {
        reload: true
      });
    }

    $scope.callRestricted = function() {
      $http({
        url: options.api.url + 'game/coin/model/',
        method: 'GET'
      }).success(function(data, status, headers, config) {
        alert("UHUUUUU");
        console.log(JSON.stringify(data));
      }).error(function(data, status, headers, config) {
        alert("Fuck!");
        console.log(JSON.stringify(data));
      })
    }

    /*
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
   */
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
      evaluation.general.text = avaliacao.text || '';
      if (avaliacao.value >= 50) {
        $scope.avaliacaoTxtHide = true;
      } else {
        $scope.avaliacaoTxtHide = false;
      }
    };

    $scope.endEval = function(avaliacao) {
      if (evaluation.general.value >= 50) {
        evaluation.general.text = '';
      }
      $window.sessionStorage.evaluation = JSON.stringify(evaluation);
      $state.go('app.home', {}, {
        reload: true
      })
    }

    $scope.nextEval = function(avaliacao) {
      if (evaluation.general.value >= 50) {
        evaluation.general.text = '';
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
    $scope.subTitle = evaluation.busId;

    $ionicLoading.show({
      template: 'loading'
    });
    $scope.txtHide = {};
    $scope.questions = {};

    $http.jsonp("http://api.trilhasp.datapublika.com/v1/evaluation/question/?format=jsonp&callback=JSON_CALLBACK").then(function(data) {
        angular.forEach(data.data.results, function(item) {
          $scope.questions[item.id] = {
            id: item.id,
            question: item.question,
            value: 50,
            text: ''
          };
          evaluation.specific[item.id] = {
            value: 50,
            text: ''
          }
          $scope.txtHide[item.id] = true;
        });
        $ionicLoading.hide();
      },
      function(err, status, headers, config) {
        $scope.message = "Erro ao carregar perguntas";
        $scope.showReload = true;
        $ionicLoading.hide();
      });

    $scope.fullNote = function(questionId) {
      $scope.questions[questionId].value = 100;
      $scope.change(questionId);
    };

    $scope.zeroNote = function(spec, questionId) {
      $scope.questions[questionId].value = 0;
      $scope.change(questionId);
    };

    $scope.change = function(spec, id) {
      evaluation.specific[id].value = spec[id].value;
      evaluation.specific[id].text = spec[id].text;
      if (spec[id].value >= 50) {
        $scope.txtHide[id] = true;
      } else {
        $scope.txtHide[id] = false;
      }
    };

    $scope.endEval = function(spec) {
      angular.forEach(evaluation.specific, function(quest, key) {
        if (quest.value >= 50) {
          evaluation.specific[key].text = '';
        }
      })
      $window.sessionStorage.evaluation = JSON.stringify(evaluation);
      console.log("##### FINAL #####")
      console.log($window.sessionStorage.evaluation);
      console.log("#################")
      $state.go('app.home', {}, {
        reload: true
      })
    }
  }
])
