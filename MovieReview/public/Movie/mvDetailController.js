app.controller('mvDetailController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg', 'rvws', 'mv',
 function($scope, $state, $http, $uibM, nDlg, rvws, mv) {
   $scope.rvws = rvws;
   $scope.mv = mv;
   console.log("Rvws: " + JSON.stringify($scope.rvws));
   console.log("Movie: " + JSON.stringify($scope.mv));

   $scope.newRvw = function() {
      console.log("New Review to be posted: " + JSON.stringify($scope.rv));
      $http.post("Mvs/" + mv.id + "/Rvws", $scope.rv)
      .then(function() {
         return $http.get('/Mvs/' + mv.id + '/Rvws');
      })
      .then(function(response) {
         $scope.rvs = response.data;
      })
      .catch(function() {
         nDlg.show($scope, "You cannot review a movie twice", "Error");
      });
   };
 }]);
