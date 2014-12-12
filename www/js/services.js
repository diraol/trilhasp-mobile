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

appServices.factory('TokenInterceptor', function($q, $window, $location, AuthenticationService) {
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
        $location.path('/login');
      }

      return $q.reject(rejection);
    }
  };
});
