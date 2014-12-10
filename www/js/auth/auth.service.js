angular.module('trilhasp.auth.services')
  .service('Auth', function($http, $location, $q, $window) {
    var Auth = {
      getToken: function() {
        return $window.localStorage.getItem('token');
      },
      setToken: function(token) {
        $window.localStorage.setItem('token', token);
      },
      deleteToken: function() {
        $window.localStorage.removeItem('token');
      },
      login: function(username, password) {
        var deferred = $q.defer();
        pi - auth / login /

          $http.post('http://api.trilhasp.datapublika.com/api-auth/login/', {
            username: username,
            password: password
          }).success(function(response, status, headers, config) {
            if (response.toke) {
              Auth.setToken(response.token);
            }

            deferred.resolve(response, status, headers, config);
          }).error(function(response, status, headers, config) {
            deferred.reject(response, status, headers, config);
          });
        return deferred.promise;
      },
      logout: function() {
        Auth.deleteToken();
        window.location = '/';
      }
    };

    return Auth;
  });

//angular.module('trilhasp.auth.services')
  //.service('Users', function($http) {
    //var Users = {
      //all: function() {
        //return $http.get('http://api.trilhasp.datapublika.com/v1/users/');
      //}
    //};
    //return Ursers;
  //});
