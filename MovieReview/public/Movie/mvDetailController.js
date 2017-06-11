app.controller('mvDetailController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg', 'rvws', 'mv',
 function($scope, $state, $http, $uibM, nDlg, rvws, mv) {
   $scope.rvws = rvws;
   $scope.mv = mv;
   $scope.avgScore = rvws.length ? (function() {
      var sum = 0;
      
      for (var rvw in rvws) {
         console.log('Review' + rvws[rvw]);
         sum += rvws[rvw].score
      } 
      return sum;
   })() / rvws.length + '/5': 'N/A';

   $scope.newRvw = function() {
      console.log("New Review to be posted: " + JSON.stringify($scope.rv));
      $http.post("Mvs/" + mv.id + "/Rvws", $scope.rv)
      .then(function() {
         return $http.get('Mvs/' + mv.id + '/Rvws');
      })
      .then(function(response) {
         $scope.rvws = response.data;
      })
      .catch(function() {
         nDlg.show($scope, "You cannot review a movie twice", "Error");
      });
   };
 }]);
