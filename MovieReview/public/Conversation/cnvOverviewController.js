app.controller('cnvOverviewController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg', 'cnvs',
 function($scope, $state, $http, $uibM, nDlg, cnvs) {
   $scope.cnvs = cnvs;
   var dupError = "Another conversation already has that title";
   var delQst = "Delete conversation entitled ";
   
   console.log("Cnvs:" + JSON.stringify(cnvs));

   $scope.editCnv = function(ndx) {
      $scope.title = cnvs[ndx].title;

      $uibM.open({
         templateUrl: "Conversation/editCnvDlg.template.html",
         scope: $scope
      }).result.then(function(title) {
         $http.put("Cnvs/" + cnvs[ndx].id, {
            title: title
         }).then(function() {
            cnvs[ndx].title = title;
         }).catch(function(err) {
            if (err && "dupTitle" === err.data[0].tag) {
               nDlg.show($scope, dupError, "Error");
            }
         })
      });
   };

   $scope.delCnv = function(ndx) {
      nDlg.show($scope, delQst + cnvs[ndx].title + '?', "Verify", 
       ['Yes', 'No']).then(function(ans) {
          if (ans === 'Yes') {
             $http.delete("Cnvs/" + cnvs[ndx].id).then(function() {
                cnvs.splice(ndx, 1);
             });
          }
       });
   }

   $scope.newCnv = function() {
      $scope.title = null;
      $scope.dlgTitle = "New Conversation";
      var selectedTitle;

      $uibM.open({
         templateUrl: 'Conversation/editCnvDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         return $http.post("Cnvs", {title: newTitle});
      })
      .then(function() {
         return $http.get('/Cnvs');
      })
      .then(function(rsp) {
         $scope.cnvs = rsp.data;
         cnvs = rsp.data;
      })
      .catch(function(err) {
         if (err && err.data[0].tag == "dupTitle") {
            nDlg.show($scope, "Another conversation already has title " + 
             selectedTitle, "Error");
         }
      });
   };
}]);
