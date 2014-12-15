appControllers.controller('UserCtrl', ['$scope', '$state', '$http', '$window', '$ionicLoading',
  function($scope, $state, $http, $window, $ionicLoading) {
    $scope.user = {
      username: 'a',
      password: 'a',
      grant_type: 'password'
    };

    if ($scope.isAuthenticated) {
      $state.go('app.home', {}, {
        reload: true
      });
    }

    $scope.submit = function(formdata) {
      $ionicLoading.show({
        template: 'conectando'
      });
      var basicCredentials = btoa("teste:teste");
      $http.defaults.headers.common['Authorization'] = 'Basic ' + basicCredentials;

      $http({
          url: options.api.auth.base_url + 'o/token/',
          method: 'POST',
          data: "grant_type=password&username=" + $scope.user.username + "&password=" + $scope.user.password,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          }
        })
        .success(function(data, status, headers, config) {
          $window.sessionStorage.token = data.access_token;
          $window.sessionStorage.isAuthenticated = true;
          $window.sessionStorage.username = formdata.username;
          $scope.isAuthenticated = true;
          $http.get(options.api.base_url + 'user/' + $window.sessionStorage.username + '/?format=json')
            .success(function(data) {
              $window.sessionStorage.userId = data.id;
              console.log(data.id);
              console.log("Saving userId");
            }).error(function() {
              console.log("UserId not saved")
            });
          console.log("Authenticated");
          $ionicLoading.hide();
          $state.go('app.home', {}, {
            reload: true
          });
        })
        .error(function(data, status, headers, config) {
          delete $window.sessionStorage.token;
          delete $window.sessionStorage.isAuthenticated;
          delete $window.sessionStorage.username;
          delete $window.sessionStorage.userId;
          $scope.isAuthenticated = false;
          alert("Falha na conexão");
          $ionicLoading.hide();
          console.log('\n\n--------------------------------------');
          console.log("data: " + JSON.stringify(data));
          console.log("status: " + status);
          console.log("headers: " + JSON.stringify(headers));
          console.log("config: " + JSON.stringify(config));
          console.log('\n--------------------------------------');
          console.log("Erro no login");
        });
    };
  }
]);

appControllers.controller('AppCtrl', function($scope, $state, $window, $http, $ionicLoading, $window) {

  //This controller updates user position and also has the logoff functions

  $scope.activeWatch = undefined;
  $scope.lastPosition = undefined;
  setupWatch(180000); //Get Position every 30 seconds

  $scope.logout = function() {
    console.log("logOut");
    if ($window.sessionStorage.isAuthenticated) {
      $ionicLoading.show({
        template: 'Desconectando...'
      });
      $window.sessionStorage.isAuthenticated = false;
      $scope.isAuthenticated = false;
      delete $window.sessionStorage.token;
      delete $window.sessionStorage.isAuthenticated;
      delete $window.sessionStorage.username;
      delete $window.sessionStorage.userId;
      $http.get(options.api.auth.base_url + 'api-auth/logout/').success(function() {
        clearInterval($scope.activeWatch);
        $ionicLoading.hide();
        $state.go('login', {}, {
          reload: true
        });
      }).error(function() {
        alert("Falha ao desconectar, tente novamente");
        $ionicLoading.hide();
      });
    } else {
      $state.go('login', {}, {
        reload: true
      });
    }
  }

  function setupWatch(freq) {
    watchLocation();
    $scope.activeWatch = setInterval(watchLocation, freq);
  }

  function watchLocation() {
    navigator.geolocation.getCurrentPosition(
      onGeoSuccess,
      onGeoError, {
        maximumAge: 180000,
        timeout: 360000,
        enableHighAccuracy: true
      }
    )
  }

  function onGeoSuccess(position) {
    //post to api
    //console.log("updating last position:\n " + JSON.stringify(position));
    if (!$scope.lastPosition ||
      Math.abs(position.coords.longitude - $scope.lastPosition.longitude) > 0.000 ||
      Math.abs(position.coords.latitude - $scope.lastPosition.latitude) > 0.000) {
      $scope.lastPosition = position.coords;

      function build_datetime_now() {
        var final_date = '',
          now = new Date();

        final_date = now.getUTCFullYear() + '-';
        final_date += now.getUTCMonth() + '-';
        final_date += now.getUTCDay() + 'T';
        final_date += now.getHours() + ':';
        final_date += now.getMinutes() + ':';
        final_date += now.getSeconds();
        final_date += Math.round(now.getUTCMilliseconds() / 100, 0) + 'Z';
        return final_date;
      }

      if (!$window.sessionStorage.userLastPostId) {
        $http.get(options.api.base_url + 'position/last/user/' + $window.sessionStorage.username + '/?format=json')
          .success(function(data) {
            $window.sessionStorage.userLastPostId = data.id;
          }).error(function(err, status, headers, config) {
            console.log("User position not recorded");
            console.log(status);
            console.log(headers);
            console.log(JSON.stringify(config));
            console.log(JSON.stringify(err) + '\n-------------------------------------------------------------\n');
          });
      }
      //Save user position
      var pos_data = {
          "id": $window.sessionStorage.userLastPostId,
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [position.coords.longitude, position.coords.latitude]
          },
          "properties": {
            "timestamp": build_datetime_now()
          }
        }
        //Update Last Position
      $http.put(options.api.base_url + 'position/last/' + $window.sessionStorage.userLastPostId + '/', pos_data).success(function(data) {
        console.log("Position recorded with PUT: \n" + JSON.stringify(pos_data) + '\n-------------------------------------------------------------\n');
      }).error(function(err, status, headers, config) {
        console.log("User position not recorded");
        console.log(status);
        console.log(headers);
        console.log(JSON.stringify(config));
        console.log(err + '\n-------------------------------------------------------------\n');
      });
      var hist_pos_data = {
          "id": $window.sessionStorage.userId,
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [position.coords.longitude, position.coords.latitude]
          },
          "properties": {
            "user": $window.sessionStorage.userId,
            "timestamp": build_datetime_now()
          }
        }
        //Update User History
      $http.post(options.api.base_url + 'position/history/', hist_pos_data).success(function(data) {
        console.log("Position recorded with PUT: \n" + JSON.stringify(hist_pos_data) + '\n-------------------------------------------------------------\n');
      }).error(function(err, status, headers, config) {
        console.log("User position not recorded");
        console.log(status);
        console.log(headers);
        console.log(JSON.stringify(config));
        console.log(JSON.stringify(err) + '\n-------------------------------------------------------------\n');
      });
    }
  }

  function onGeoError(error) {
    console.log('code:' + error.code + '\n' + 'message: ' + error.message + '\n');
  }
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
  '$ionicLoading',
  '$window',
  function(
    $scope,
    $cordovaGeolocation,
    $stateParams,
    $ionicModal,
    $ionicPopup,
    $http,
    $interval,
    $ionicLoading,
    $window
  ) {
    //console.log('MapCtrl');
    $ionicLoading.show({
      template: 'Carregando mapa'
    });

    function populateMap() {
      //console.log(current_pos); #TODO
      //
      $http.jsonp(options.api.base_url + "position/last/?format=jsonp&callback=JSON_CALLBACK")
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
          $ionicLoading.hide();
        })
        .error(function(err, status, headers, config) {
          console.log("não deu certo");
          console.log(status);
          console.log(headers);
          console.log(config);
          console.log(err);
          $ionicLoading.hide();
        });
    }

    function autoPopulate() {
      $interval(function() {
        populateMap();
      }, 180000); // Update people position every 30 seconds
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

appControllers.controller('AvCtrl', [
  '$scope',
  '$state',
  '$window',
  'QRScanService',
  '$http',
  '$ionicLoading',
  function(
    $scope,
    $state,
    $window,
    QRScanService,
    $http,
    $ionicLoading) {
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
            $ionicLoading.show({
              template: 'Buscando ônibus' + result.result.text
            });
            $http.get(options.api.base_url + "/evaluation/bus/" + result.result.text + "/?format=json")
              .success(function(data) {
                //TODO: Check bus active
                evaluation.busId = result.result.text;
                evaluation.busLine = data.bus_line_code.split(" ")[0];
                $window.sessionStorage.evaluation = JSON.stringify(evaluation);
                $ionicLoading.hide();
                $state.go('app.avaliacaogeral', {}, {
                  reload: true
                });
              })
              .error(function() {
                $ionicLoading.hide();
                $scope.message = '<b>ERRO</b>: ônibus não encontrado';
              })
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
    }
    $scope.clear = function() {
      $scope.message = '';
    }
  }
]);

appControllers.controller('AvGeralCtrl', [
  '$scope',
  '$state',
  '$ionicViewService',
  '$window',
  '$http',
  function(
    $scope,
    $state,
    $ionicViewService,
    $window,
    $http) {

    $ionicViewService.clearHistory();
    var evaluation = JSON.parse($window.sessionStorage.evaluation);
    $scope.subTitle = evaluation.busId + " (" + evaluation.busLine + ")";
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

    function save_data(user_location, destination) {
      var data = {
        question: 'http://api.trilhasp.datapublika.com/v1/evaluation/question/1/',
        user: 'http://api.trilhasp.datapublika.com/v1/user/' + $window.sessionStorage.username + '/',
        timestamp: build_datetime_now(),
        bus_unique_number: 'http://api.trilhasp.datapublika.com/v1/evaluation/bus/' + evaluation.busId + '/',
        answer_value: evaluation.general.value,
        answer_text: evaluation.general.text,
        geolocation: user_location
      }
      $http.post(options.api.base_url + 'evaluation/answer/', data).success(function() {
        console.log('general question saved');
        $window.sessionStorage.evaluation = JSON.stringify(evaluation);
        $state.go(destination, {}, {
          reload: true
        })
      }).error(function(err, status, headers, config) {
        console.log("User general evaluation not recorded");
        console.log(status);
        console.log(headers);
        console.log(JSON.stringify(config));
        //console.log(err + '\n-------------------------------------------------------------\n');
      })
    }

    function saveEvaluation(destination) {
      if (evaluation.general.value >= 50) {
        evaluation.general.text = '';
      }

      navigator.geolocation.getCurrentPosition(
        function(position) {
          console.log(JSON.stringify(position));
          save_data("POINT (" + position.coords.longitude + " " + position.coords.latitude + ")", destination);
        },
        function(error) {
          console.log("Location error " + error);
          save_data("POINT (-46.6361100000000022 -23.5474999999999994)", destination);
        }, {
          maximumAge: 180000,
          timeout: 360000,
          enableHighAccuracy: true
        }
      );
    }

    $scope.endEval = function(avaliacao) {
      saveEvaluation('app.home');
    }

    $scope.nextEval = function(avaliacao) {
      saveEvaluation('app.avaliacaoespecifica');
    }
  }
]);

appControllers.controller('AvEspecificaCtrl', ['$scope', '$state', '$ionicViewService', '$ionicLoading', '$http', '$window',
  function($scope, $state, $ionicViewService, $ionicLoading, $http, $window) {
    $ionicViewService.clearHistory();
    $ionicLoading.show({
      template: 'loading'
    });
    var evaluation = JSON.parse($window.sessionStorage.evaluation);
    $scope.subTitle = evaluation.busId;
    $scope.txtHide = {};
    $scope.questions = {
      values: {},
      texts: {},
      headers: {},
      ids: {}
    };

    $http.jsonp(options.api.base_url + "/evaluation/question/?format=jsonp&callback=JSON_CALLBACK").then(function(data) {
        console.log("\n");
        console.log(JSON.stringify(data.data.results));
        console.log("\n");
        console.log("\n");
        var local_counter = 0;
        angular.forEach(data.data.results, function(item, index) {
          if (item.id != 1) {
            console.log(local_counter + ": " + JSON.stringify(item));
            $scope.questions.values[local_counter] = 50;
            $scope.questions.texts[local_counter] = '';
            $scope.questions.headers[local_counter] = item.question;
            $scope.questions.ids[local_counter] = item.id
            evaluation.specific[item.id] = {
              value: 50,
              text: ''
            }
            $scope.txtHide[local_counter] = true;
            local_counter++;
          }
        });
        console.log("\n");
        console.log("Questions: " + JSON.stringify($scope.questions) + "\n");
        $ionicLoading.hide();
      },
      function(err, status, headers, config) {
        $scope.message = "Erro ao carregar perguntas";
        $scope.showReload = true;
        $ionicLoading.hide();
      });

    $scope.fullNote = function(index) {
      $scope.questions.values[index] = 100;
      $scope.change(index);
    };

    $scope.zeroNote = function(index) {
      $scope.questions.values[index] = 0;
      $scope.change(index);
    };

    $scope.change = function(index) {
      var id = $scope.questions.ids[index];
      evaluation.specific[id].value = $scope.questions.values[index];
      evaluation.specific[id].text = $scope.questions.texts[index];
      if ($scope.questions.values[index] >= 50) {
        $scope.txtHide[index] = true;
      } else {
        $scope.txtHide[index] = false;
      }
    };

    function save_data(user_location, destination) {
      angular.forEach(evaluation.specific, function(quest, key) {
        var data = {
          question: 'http://api.trilhasp.datapublika.com/v1/evaluation/question/' + key + '/',
          user: 'http://api.trilhasp.datapublika.com/v1/user/' + $window.sessionStorage.username + '/',
          timestamp: build_datetime_now(),
          bus_unique_number: 'http://api.trilhasp.datapublika.com/v1/evaluation/bus/' + evaluation.busId + '/',
          answer_value: quest.value,
          answer_text: quest.text,
          geolocation: user_location
        }
        $http.post(options.api.base_url + 'evaluation/answer/', data).success(function() {
          console.log('specific questions ' + key + 'saved');
          $window.sessionStorage.evaluation = JSON.stringify(evaluation);
          delete evaluation.specific[key];
          if (Object.keys(evaluation.specific).length <= 0) {
            delete $window.sessionStorage.evaluation;
            $state.go(destination, {}, {
              reload: true
            })
          }
        }).error(function(err, status, headers, config) {
          console.log("User specific evaluation for question " + key + " not recorded");
          console.log(status);
          console.log(headers);
          console.log(JSON.stringify(config));
          //console.log(err + '\n-------------------------------------------------------------\n');
          alert('Nem todos os dados foram salvos, por favor tente novamente');
        });
      });
    }

    $scope.endEval = function(spec) {
      angular.forEach(evaluation.specific, function(quest, key) {
        if (quest.value >= 50) {
          evaluation.specific[key].text = '';
        }
      })

      navigator.geolocation.getCurrentPosition(
        function(position) {
          console.log(JSON.stringify(position));
          save_data("POINT (" + position.coords.longitude + " " + position.coords.latitude + ")", 'app.home');
        },
        function(error) {
          console.log("Location error " + error);
          save_data("POINT (-46.6361100000000022 -23.5474999999999994)", 'app.home');
        }, {
          maximumAge: 180000,
          timeout: 360000,
          enableHighAccuracy: true
        }
      );
    }
  }
])
