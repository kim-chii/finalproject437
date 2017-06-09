
app.config(['$stateProvider', '$urlRouterProvider',
   function($stateProvider, $router) {

      //redirect to home if path is not matched
      $router.otherwise("/");

      $stateProvider
      .state('home',  {
         url: '/',
         templateUrl: 'Home/home.template.html',
         controller: 'homeController',
      })
      .state('login', {
         url: '/login',
         templateUrl: 'Login/login.template.html',
         controller: 'loginController',
      })
      .state('logout', {
         url: '/',
         controller: 'homeController',
      })
      .state('register', {
         url: '/register',
         templateUrl: 'Register/register.template.html',
         controller: 'registerController',
      })
      .state('cnvOverview', {
         url: '/cnvs',
         templateUrl: 'Conversation/cnvOverview.template.html',
         controller: 'cnvOverviewController',
         resolve: {
            cnvs: ['$q', '$http', function($q, $http) {
               return $http.get('/Cnvs')
               .then(function(response) {
                  return response.data;
               });
            }]
         }
      })
      .state('myCnvOverview', {
         url: '/myCnvs/:prsId',
         templateUrl: 'Conversation/cnvOverview.template.html',
         controller: 'cnvOverviewController',
         resolve: {
            cnvs: ['$q', '$http', '$stateParams', function($q, $http, sp) {
               return $http.get('/Cnvs' + (sp.prsId ? 
                '?owner=' + sp.prsId : ''))
                .then(function(response) {
                   return response.data;
                });
            }]
         }
      })
      .state('cnvDetail', {
         url: '/cnvs/:cnvId',
         templateUrl: 'Conversation/cnvDetail.template.html',
         controller: 'cnvDetailController',
         resolve: {
            msgs: ['$q', '$http', '$stateParams', function($q, $http, sp) {
               return $http.get('/Cnvs/' + sp.cnvId + '/Msgs')
                .then(function(response) {
                   return response.data;
                });
            }],
            cnv: ['$q', '$http', '$stateParams', function($q, $http, sp) {
               return $http.get('/Cnvs/' + sp.cnvId)
                .then(function(response) {
                   console.log(response.data);
                   return response.data;
                });
            }]
         }
      });
   }]);
