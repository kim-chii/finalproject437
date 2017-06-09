app.controller('mvOverviewController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg', 'mvs',
 function($scope, $state, $http, $uibM, nDlg, cnvs) {
   $scope.mvs = mvs;
   var dupError = "This movie has already been added";
   var delQst = "Delete movie entitled ";
   
   console.log("Mvs:" + JSON.stringify(mvs));

   $scope.editMv = function(ndx) {
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
            if (err && "dupEntry" === err.data[0].tag) {
               nDlg.show($scope, dupError, "Error");
            }
         })
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
      $scope.title = null;
      $scope.dlgTitle = "New Movie";
      var selectedTitle;

      $uibM.open({
         templateUrl: 'Movie/editMvDlg.template.html',
         scope: $scope
      }).result
      .then(function(newMovie) {
         //return $http.post("Mvs", {title: newTitle});
         console.log(JSON.stringify(newMovie));
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
