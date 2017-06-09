app.controller('mvOverviewController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg', 'mvs',
 function($scope, $state, $http, $uibM, nDlg, cnvs) {
   $scope.mvs = mvs;
   var dupError = "This movie has already been added";
   var delQst = "Delete movie entitled ";
   
   console.log("Mvs:" + JSON.stringify(mvs));

   $scope.editCnv = function(ndx) {
      $scope.title = cnvs[ndx].title;

      $uibM.open({
         templateUrl: "Movie/editMvDlg.template.html",
         scope: $scope
      }).result.then(function(title) {
         $http.put("mvs/" + mvs[ndx].id, {
            title: title || mvs[ndx].title,
            director: director || mvs[ndx].director,
            releaseYear: releaseYear || mvs[ndx].releaseYear,
            genre: genre || mvs[ndx].genre
         }).then(function() {
            mvs[ndx].title = title || mvs[ndx].title;
            mvs[ndx].director = director || mvs[ndx].director,
            mvs[ndx].releaseYear = releaseYear || mvs[ndx].releaseYear,
            mvs[ndx].genre = genre || mvs[ndx].genre
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
