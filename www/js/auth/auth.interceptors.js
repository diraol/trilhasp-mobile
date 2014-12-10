angular.module('trilhasp.auth.interceptors')
  .service('AuthInterceptor', function($injector, $location) {
      var AuthInterceptor = {
        request: function(config) {
          var Auth = $injector.get('Auth');
          var token = Auth.getToken();
          if (token) {
            config.headers['Authorization'] = 'JWT' + token
          }
          return config;
        },
        responseError: function(response) {
          if (response.status === 403) {
            $location.path('/login')
          }
          return response;
        }
      }
    return AuthInterceptor;
  });
