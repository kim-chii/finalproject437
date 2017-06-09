
var app = angular.module('mainApp', [
   'ui.router',
   'ui.bootstrap'
]);

app.constant("languages", [{
   spelling: {
      english: "English",
      spanish: "Inglés"
   },
   selector: "english"
}, {
   spelling: {
      english: "Spanish",
      spanish: "Español"
   },
   selector: "spanish"
}]);

app.constant("errMap", {
   missingField: 'Field missing from request: ',
   badValue: 'Field has bad value: ',
   notFound: 'Entity not present in DB',
   badLogin: 'Email/password combination invalid',
   dupEmail: 'Email duplicates an existing email',
   noTerms: 'Acceptance of terms is required',
   forbiddenRole: 'Role specified is not permitted.',
   noOldPwd: 'Change of password requires an old password',
   oldPwdMismatch: 'Old password that was provided is incorrect.',
   dupTitle: 'Conversation title duplicates an existing one',
   dupEnrollment: 'Duplicate enrollment',
   forbiddenField: 'Field in body not allowed.',
   queryFailed: 'Query failed (server problem).'
});

app.filter('tagError', ['errMap', '$rootScope', function(errMap, rs) {
   return function(err) {
      var lang = rs.language;
      var prefix = (lang === 'spanish') ? '[ES]' : '';
      return prefix + errMap[err.tag] + (err.params ? err.params[0] : "");
   };
}]);

app.directive('mvLineTemplate', [function() {
   return {
      restrict: "E",
      templateUrl: "Movie/mvLine.template.html",
      scope: {
         mv: "=toSummarize",
         id: "=userId",
         edit: "&",
         delete: "&"
      }
   };
}]);
