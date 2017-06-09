app.controller('mvDetailController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg', 'msgs', 'cnv',
 function($scope, $state, $http, $uibM, nDlg, msgs, cnv) {
   $scope.msgs = msgs;
   $scope.cnv = cnv;

   console.log('Cnv: ' + JSON.stringify(cnv));

   $scope.newMsg = function() {
      $http.post("Cnvs/" + cnv.id + "/Msgs", {content: $scope.newMsgContent})
      .then(function() {
         return $http.get('/Cnvs/' + cnv.id + '/Msgs');
      })
      .then(function(response) {
         $scope.msgs = response.data;
      });
   };
 }]);
