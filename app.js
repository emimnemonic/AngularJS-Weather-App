var app = angular.module('weatherApp', ['ngResource', 'ngAnimate']);

app.service('WeatherData', ['$resource', '$q', function ($resource, $q) {
    this.getLocation = function() {
        var deferred = $q.defer();
        if (!navigator) {
            deferred.reject(new Error("Location not available"));
        } else {
            navigator.geolocation.getCurrentPosition(function (position) {
                deferred.resolve({
                    pos: position.coords.latitude + "," + position.coords.longitude
                });
            }, deferred.reject);
        } return deferred.promise;
    };
    
    this.getForecast = function(pos,units) {
        return $resource('https://api.forecast.io/forecast/YOURAPIKEY/' + pos + "?units=" + units + "&exclude=minutely,hourly,daily&callback=JSON_CALLBACK", null, {
            'jsonp_query': {method: 'JSONP'}
        });
    };
        
    this.getLocationInfo = function(pos) {
        return $resource('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + pos + '&key=YOURAPIKEY', null, {
            'query': {method: 'GET', isArray: false}
        });
    };
    
    var iconClasses = [{
        id: 'clear-day', class: 'ion-ios-sunny-outline'
    }, {
        id: 'clear-night', class: 'ion-ios-moon-outline'
    }, {
        id: 'partly-cloudy-day', class: 'ion-ios-partlysunny-outline'
    }, {
        id: 'partly-cloud-night', class: 'ion-ios-cloudy-night-outline'
    }, {
        id: '03d', class: 'ion-ios-cloud-outline'
    }, {
        id: 'cloudy', class: 'ion-ios-cloud'
    }, {
        id: 'rain', class: 'ion-ios-rainy-outline'
    }, {
        id: 'sleet', class: 'ion-ios-rainy'
    }, {
        id: 'wind', class: 'ion-paper-airplane'
    }, {
        id: 'snow', class: 'ion-ios-snowy'
    }, {
        id: 'fog', class: 'ion-coffee'
    }];
    
    this.getIconClass = function(iconId) {
        var iconClass = "";
        for (i = 0; i < iconClasses.length; i++) {
            if (iconClasses[i].id == iconId) {
                iconClass = iconClasses[i].class;
            }
        }
        return iconClass;
    };
}]);

app.controller('WeatherController', ['$scope', 'WeatherData', function($scope, WeatherData) {
    
    $scope.showApp = false;
    $scope.showError = false;
    $scope.unitsCel = "si";
    $scope.unitsFar = "us";

    $scope.getWeather = function() {
        WeatherData.getLocation().then(function (position) {
            $scope.position = position.pos;  
            console.log($scope.position);
           
           // Get city name and country
            $scope.locationInfo = WeatherData.getLocationInfo($scope.position).query(function(response) {
                $scope.locationInfo = response.results[0];
                console.log($scope.locationInfo);
                $scope.city = $scope.locationInfo['address_components'][3]['long_name'];
                $scope.country = $scope.locationInfo['address_components'][5]['long_name'];
                
                // Get forecast data
                $scope.forecast = WeatherData.getForecast($scope.position, $scope.unitsCel).jsonp_query(
                function(response) {
                    $scope.forecast = response;
                    $scope.temperature = $scope.forecast.currently.temperature;
                    $scope.summary = $scope.forecast.currently.summary;
                    $scope.icon = $scope.forecast.currently.icon;
                    // Get icon class
                    $scope.iconClass = WeatherData.getIconClass($scope.icon);
                    // Get Farenheit temperature
                    $scope.temperatureFar = WeatherData.getForecast($scope.position, $scope.unitsFar).jsonp_query(function(response) {
                        $scope.temperatureFar = response.currently.temperature;
                        $scope.showApp = true;
                    }, function(response) {
                        $scope.showError = true;
                        console.log(response.status);
                    });
                }, function(response) {
                    $scope.showError = true;
                    console.log(response.status);
                });
            }, function(response) {
                $scope.showError = true;
                console.log(response.status);
            });
       }, function(err) {
            $scope.showError = true;
            console.log(err);
        });   
    };
}]);
