var app = angular.module('app', ['angular-loading-bar']);

function mainCtrl($scope, $http) {

  if (localStorage.getItem('city')) {
    $http.get('/api/bars/' + localStorage.getItem('city'))
      .success(function(data) {
        $scope.bars = data;
      })
      .error(function(err) {
      });
  }

  $scope.searchBars = function(city) {
    localStorage.setItem('city', city);
    $http.get('/api/bars/' + city)
      .success(function(data) {
        $scope.bars = data;
      })
      .error(function(err) {
      });
  };

  $scope.goToBars = function(id) {

    $http.post('/api/bars/' + id).success(function(data, status) {
      $scope.id = data;
    });
  };
}
