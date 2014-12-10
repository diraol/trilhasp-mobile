// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic']);


app.controller('MapCtrl', function($scope, $ionicLoading) {

  google.maps.event.addDomListener(window, 'load', function() {
    var myLatlng = new google.maps.LatLng(-23.6824124, -46.5952992);

    var mapOptions = {
        center: myLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    navigator.geolocation.watchPosition(function(pos) {
      map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      var myLocation = new google.maps.Marker({
          position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
          map: map,
          title: "Localização"
      });
    });

    $scope.map = map;
  });
});

app.controller('QrCtrl', ['$scope', 'QRScanService', function($scope, QRScanService){
  $scope.click = function(){
    console.log('click');
    QRScanService.scan();
  };
}]);

app.factory("QRScanService", [function () {
  return {
    scan: function(success, fail) {
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          // alert("We got a barcode\n" +
          // "Result: " + result.text + "\n" +
          // "Format: " + result.format + "\n" +
          // "Cancelled: " + result.cancelled);
          var linha = document.getElementById("linha");
          linha.innerHTML = result.text;
        },
        function (error) {
          alert("Scanning failed: " + error);
        }
      );
    }
  };
}]);


function printValue(sliderID) {
  var y = document.getElementById(sliderID);
  var texto = document.getElementsByClassName("extra");

  if (y.value < 50) {
    y.nextElementSibling.style.display='block';
  } else {
    y.nextElementSibling.style.display='none';
  }
}

app.run(function($ionicPlatform) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    // Enable background mode
    cordova.plugins.backgroundMode.enable();
    // Android customization
    cordova.plugins.backgroundMode.configure({ title: "TrilhaSP", ticker: "Rodando em segundo plano", text: "Rodando em segundo plano. Clique para ativar." });
  });
});
