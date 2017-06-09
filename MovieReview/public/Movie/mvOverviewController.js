app.controller('mvOverviewController',
['$scope', '$rootScope', '$state', '$http', '$uibModal', 'notifyDlg', 'mvs',
function($scope, $root, $state, $http, $uibM, nDlg, mvs) {
   $scope.mvs = mvs;
   var dupError = "This movie has already been added";
   var delQst = "Delete movie entitled ";

   console.log("Mvs:" + JSON.stringify(mvs));

   $scope.editMv = function(ndx) {
      //prepopulate textbox
      $scope.title = mvs[ndx].title;
      $scope.mv = $scope.mvs[ndx];

      $uibM.open({
         templateUrl: "Movie/editMvDlg.template.html",
         scope: $scope
      }).result
      .then(function() {
         console.log(JSON.stringify($scope.mv));
         $http.put("mvs/" + $scope.mv.id, $scope.mv);
      })
      .then(function() {
         return $http.get('/Mvs');
      })
      .then(function(rsp) {
         $scope.mvs = rsp.data;
         mvs = rsp.data;
      })
      .catch(function(err) {
         if (err && "dupEntry" === err.data[0].tag) {
            nDlg.show($scope, dupError, "Error");
         }
      });
   };

   $scope.delMv = function(ndx) {
      nDlg.show($scope, delQst + mvs[ndx].title + '?', "Verify",
      ['Yes', 'No']).then(function(ans) {
         if (ans === 'Yes') {
            $http.delete("Mvs/" + mvs[ndx].id).then(function() {
               mvs.splice(ndx, 1);
            });
         }
      });
   }

   $scope.newMv = function() {
      $scope.mv = {ownerId: $root.user.usrId}
      $scope.dlgTitle = "New Movie";
      var selectedTitle;

      $uibM.open({
         templateUrl: 'Movie/editMvDlg.template.html',
         scope: $scope
      }).result
      .then(function() {
         console.log(JSON.stringify($scope.mv));
         return $http.post("Mvs", $scope.mv);
      })
      .then(function() {
         return $http.get('/Mvs');
      })
      .then(function(rsp) {
         $scope.mvs = rsp.data;
         mvs = rsp.data;
      })
      .catch(function(err) {
         if (err && err.data[0].tag == "dupEntry") {
            nDlg.show($scope, dupError, "Error");
         }
      });
   };
}]);
