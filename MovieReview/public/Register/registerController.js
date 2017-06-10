app.controller('registerController',
 ['$scope', '$rootScope', '$state', 'login','$http', 'notifyDlg',
 function($scope, $rs, $state, login,$http, nDlg) {
   $scope.user = {role: 0};
   $scope.errors = [];

   $scope.registerUser = function() {
      $http.post("Usrs", $scope.user)
      .then(function() {
         return nDlg.show($scope, "Registration succeeded.  " +
          "Login automatically?",
          "Login", ["Yes", "No"]);
      })
      .then(function(btn) {
         $http.post("Ssns", $scope.user)
         .then(function() {
            if (btn == "Yes") {
               login.login($scope.user)
               .then(function(user) {
                  $rs.user = user;
                  $state.go('mvOverview');
               })
               .catch(function() {
                  nDlg.show($scope, "That name/password is not in our" +
                   " records", "Error");
               });

            }
            else {
               $state.go('home');
            }
         })
         .catch(function() {
            nDlg.show($scope, "Login failed", "Error");
         });
      })
      .then(function(response) {
          var location = response.headers().location.split('/');
          return $http.get("Ssns/" + location[location.length - 1]);
      })
      .then(function() {
          $state.go('home');
       })
      .catch(function(err) {
         $scope.errors = err.data;
      });
   };

   $scope.quit = function() {
      $state.go('home');
   };
}]);
