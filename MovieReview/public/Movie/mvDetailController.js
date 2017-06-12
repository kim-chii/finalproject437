app.controller('mvDetailController',
 ['$scope', '$state', '$http', '$uibModal', '$q', 'notifyDlg', 'rvws', 'mv',
 function($scope, $state, $http, $uibM, $q, nDlg, rvws, mv) {
   $scope.rvws = rvws;
   $scope.mv = mv;
   $scope.sentiment = {};
   console.log("Rvws: " + JSON.stringify($scope.rvws));
   console.log("Movie: " + JSON.stringify($scope.mv));
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
      .catch(function(err) {
         if (err.data[0].tag === "dupReview") {
            nDlg.show($scope, "You cannot review a movie twice", "Error");
         } else {
            nDlg.show($scope, "You must fill the required fields ", "Error");
         }
      });
   };

   var init = function() {
      var queries = [];
      rvws.forEach(function(rev, i) {
         queries[i] = $http.get('/Rvws/' + rev.id + '/Sentiment');
      });

      $q.all(queries).then(function(results) {
         results.forEach(function(rev) {
            var emails = {};
            var totalSent = 0;
            Object.keys(rev.data).forEach(function(key){
               var sentiment = rev.data[key];
               emails[sentiment.username] = sentiment.sentiment;
               totalSent += sentiment.sentiment;
            });

            $scope.sentiment[rev.data[0].id] = {
               emails: emails,
               sentiment: totalSent
            };

         });
      });

      console.log($scope.sentiment)

   };

   init();
 }]);
