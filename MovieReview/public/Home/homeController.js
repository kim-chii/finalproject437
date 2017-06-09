app.controller('homeController', 
 ['$scope', '$state', 'login', '$rootScope', 'languages', 
 function($scope, $state, login, rs, langs) {
   $scope.languages = langs;
   $scope.language = $scope.languages[0];

   $scope.setLanguage = function(ndx) {
      $scope.language = $scope.languages[ndx];
      rs.language = $scope.language.selector;
   };

   $scope.logout = function() {
      login.logout()
      .then(function() {
         rs.user = null;
 //        $scope.user = null;
         $state.go('home');
      });
   }
}]);
