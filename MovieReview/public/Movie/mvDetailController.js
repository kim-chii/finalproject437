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
         }
         else {
            nDlg.show($scope, "You must fill the required fields ", "Error");
         }
      });
   };

   $scope.like = function(id) {
      likeReview(1, id);
   };

   $scope.dislike = function(id) {
      likeReview(-1, id);
   };

   var likeReview = function(sentimentScore, revId) {
      var username = $scope.user.email;
      var sentiment = $scope.sentiment[revId] ?
       $scope.sentiment[revId].emails[username] : null;
      var queries = [];

      if (sentiment) {
         queries[0] = $http.delete('/Rvws/' + revId +
          '/Sentiment/' + sentiment.id)
         .then(function() {
            if (sentiment.sentiment !== sentimentScore) {
               queries[1] = $http.post('/Rvws/' + revId + '/Sentiment',
                {sentiment: sentimentScore});
            }
         });
      }
     else {
        queries[0] = $http.post('/Rvws/' + revId + '/Sentiment',
         {sentiment: sentimentScore})
      }

      $q.all(queries).then(function(results) {
         init();
      });
   };

   var init = function() {
      var queries = [];
      rvws.forEach(function(rev, i) {
         queries[i] = $http.get('/Rvws/' + rev.id + '/Sentiment');
      });

      $q.all(queries).then(function(results) {
         results.forEach(function(result, ndx) {
            var emails = {};
            var totalSent = 0;
            Object.keys(result.data).forEach(function(key){
               var sentiment = result.data[key];
               emails[sentiment.username] = {
                  id: sentiment.id, sentiment: sentiment.sentiment
               };
               totalSent += sentiment.sentiment;
            });

            $scope.sentiment[rvws[ndx].id] = {
               emails: emails,
               sentiment: totalSent
            };

         });
      });

   };

   init();
 }]);
