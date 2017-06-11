app.controller('mvOverviewController',
['$scope', '$rootScope', '$state', '$http', '$uibModal', 'notifyDlg', 'mvs',
'rvws', function($scope, $root, $state, $http, $uibM, nDlg, mvs, rvws) {
   var dupError = "This movie has already been added";
   var delQst = "Delete movie entitled ";
   var ndx1, ndx2;

   //filter mvs to only include those a user has reviewed if rvws is defined
   if (rvws) {
      var filtered = [];
      for (ndx1 = 0; ndx1 < mvs.length; ndx1++) {
         for (ndx2 = 0; ndx2 < rvws.length; ndx2++) {
            if (mvs[ndx1].id === rvws[ndx2].mvId) {
               filtered.push(mvs[ndx1]);
               break;
            }
         }
      }
      
      mvs = filtered;
   }

   $scope.mvs = mvs;
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
