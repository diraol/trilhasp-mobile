appServices.factory('AuthenticationService', function($window) {
  var auth = {};
  if (!$window.sessionStorage.isAuthenticated) {
    console.log("Não autenticado");
    auth.isAuthenticated = false;
    auth.isAdmin = false;
  } else {
    console.log("autenticado");
    auth.isAuthenticated = true;
    auth.isAdmin = true;
  }

  return auth;
});

appServices.factory('UserService', function($http, $cookies) {
  return {
    signIn: function(username, password) {
      var payload = "grant_type=password&username=" + username + "&password=" + password + "&client_id=" + options.api.auth.client_id + "&client_secret=" + options.api.auth.client_secret;
      var payload_json = {
        grant_type: 'password',
        username: username,
        password: password,
        client_id: options.api.auth.client_id,
        client_secret: options.api.auth.client_secret
      };
      return $http.post(options.api.auth.base_url + 'o/token/', payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
    },

    logOut: function() {
      return $http.get(options.api.auth.base_url + 'api-auth/logout/');
    },

    register: function(username, password, passwordConfirmation) {
      return $http.post(options.api.auth.base_url + 'user/register', {
        username: username,
        password: password,
        passwordConfirmation: passwordConfirmation
      });
    }
  }
});

appServices.factory('authInterceptor', function($rootScope, $q, $window) {
    return {
        request: function(config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token){
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            }
            return config;
        },
        responseError: function(rejection){
            if (rejection.status === 401) {
                alert("User is not Authenticated");
            }
            return $q.reject(rejection);
        }
    };
});

appServices.factory('TokenInterceptor', function($state, $q, $window, $location, AuthenticationService) {
  return {
    request: function(config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
      }
      return config;
    },

    requestError: function(rejection) {
      return $q.reject(rejection);
    },

    /* Set Authentication.isAuthenticated to true if 200 received */
    response: function(response) {
      if (response != null && response.status == 200 && $window.sessionStorage.token && !AuthenticationService.isAuthenticated) {
        AuthenticationService.isAuthenticated = true;
      }
      return response || $q.when(response);
    },

    /* Revoke client authentication if 401 is received */
    responseError: function(rejection) {
      if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || AuthenticationService.isAuthenticated)) {
        delete $window.sessionStorage.token;
        AuthenticationService.isAuthenticated = false;
        $state.go('login', {}, {
          reload: true
        });
      }

      return $q.reject(rejection);
    }
  };
});

appServices.service("QRScanService", function($q) {

  this.scan = function() {
    var deferred = $q.defer();
    try {

      cordova.plugins.barcodeScanner.scan(
        function(result) { // success
          // alert("We got a barcode\n" +
          // "Result: " + result.text + "\n" +
          // "Format: " + result.format + "\n" +
          // "Cancelled: " + result.cancelled);
          //var busId = document.getElementById("busId");
          //busId.innerHTML = result.text;
          deferred.resolve({
            'error': false,
            'result': result
          });
        },
        function(error) { // failure
          deferred.resolve({
            'error': true,
            'result': error.toString()
          });
        }
      );
    } catch (exc) {
      deferred.resolve({
        'error': true,
        'result': 'exception: ' + exc.toString()
      });
    }
    return deferred.promise;
  };
});

appServices.factory('EvaluationService', function() {
  var evaluation = {
    busId: 0,
    general: {
      value: 0,
      text: ''
    },
    specific: {} // This should be populated based on api request
  }

  return {
    getBusId: function() {
      return evaluation.busId;
    },
    setBusId: function(selectedBusId) {
      evaluation.busId = selectedBusId;
    },
    setGeneralValue: function(value) {
      evaluation.general.value = value;
    },
    setGeneralText: function(value) {
      evaluation.general.value = value;
    },
    setSpecificItems: function(itemsDict) {
        evaluation.specific = itemsDict;
    },
    setSpecificItemValue: function(item, value) {
      evaluation.specificEval.item.value = value;
    },
    setSpecificItemText: function(item, text) {
      evaluation.specificEval.item.text = text;
    },
    getAll: function(){
        return evaluation;
    }
  }

});
//
//appServices.factory('
//    PostService ', function($http) {
//  return {
//    findAllPublished: function() {
//      return $http.get(options.api.base_url + ' / post ');
//    },
//
//    findByTag: function(tag) {
//      return $http.get(options.api.base_url + ' / tag / ' + tag);
//    },
//
//    read: function(id) {
//      return $http.get(options.api.base_url + ' / post / ' + id);
//    },
//
//    findAll: function() {
//      return $http.get(options.api.base_url + ' / post / all ');
//    },
//
//    changePublishState: function(id, newPublishState) {
//      return $http.put(options.api.base_url + ' / post ', {
//        '
//    post ': {
//          _id: id,
//          is_published: newPublishState
//        }
//      });
//    },
//
//    delete: function(id) {
//      return $http.delete(options.api.base_url + ' / post / ' + id);
//    },
//
//    create: function(post) {
//      return $http.post(options.api.base_url + ' / post ', {
//        '
//    post ': post
//      });
//    },
//
//    update: function(post) {
//      return $http.put(options.api.base_url + ' / post ', {
//        '
//    post ': post
//      });
//    },
//
//    like: function(id) {
//      return $http.post(options.api.base_url + ' / post / like ', {
//        '
//    id ': id
//      });
//    },
//
//    unlike: function(id) {
//      return $http.post(options.api.base_url + ' / post / unlike ', {
//        '
//    id ': id
//      });
//    }
//  };
//});
//
//appServices.factory('
//    LikeService ', function($window) {
//  //Contains post ids already liked by the user
//  var postLiked = [];
//
//  if ($window.sessionStorage && $window.sessionStorage.postLiked) {
//    postLiked.push($window.sessionStorage.postLiked);
//  }
//
//
//  return {
//    isAlreadyLiked: function(id) {
//      if (id != null) {
//        for (var i in postLiked) {
//          if (postLiked[i] == id) {
//            return true;
//          }
//        }
//
//        return false;
//      }
//
//      return false;
//    },
//
//    like: function(id) {
//      if (!this.isAlreadyLiked(id)) {
//        postLiked.push(id);
//        $window.sessionStorage.postLiked = postLiked;
//      }
//    },
//
//    unlike: function(id) {
//      if (this.isAlreadyLiked(id)) {
//        for (var i in postLiked) {
//          if (postLiked[i] == id) {
//            postLiked.splice(i, 1);
//            $window.sessionStorage.postLiked = postLiked;
//
//            break;
//          }
//        }
//      }
//    }
//  }
//});
