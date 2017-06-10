app.controller('loginController',
 ['$scope', '$rootScope', '$state', 'login', 'notifyDlg',
 function($scope, $rs, $state, login, nDlg) {

   $scope.login = function() {
      login.login($scope.user)
      .then(function(user) {
         $rs.user = user;
         $state.go('mvOverview');
      })
      .catch(function() {
         nDlg.show($scope, "That name/password is not in our records", "Error");
      });
   };

   $scope.logout = function() {
      login.logout().then($state.go('home'));
   }
}]);
