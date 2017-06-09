
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
      .state('mvOverview', {
         url: '/mvs',
         templateUrl: 'Movie/mvOverview.template.html',
         controller: 'mvOverviewController',
         resolve: {
            mvs: ['$q', '$http', function($q, $http) {
               return $http.get('/Mvs')
               .then(function(response) {
                  return response.data;
               });
            }]
         }
      })
      .state('myMvOverview', {
         url: '/myMvs/:usrId',
         templateUrl: 'Movie/mvOverview.template.html',
         controller: 'mvOverviewController',
         resolve: {
            mvs: ['$q', '$http', '$stateParams', function($q, $http, sp) {
               return $http.get('/Mvs' + (sp.usrId ?
                '?owner=' + sp.usrId : ''))
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
      .state('mvDetail', {
         url: '/mvs/:mvId',
         templateUrl: 'Movie/mvDetail.template.html',
         controller: 'mvDetailController',
         resolve: {
            msgs: ['$q', '$http', '$stateParams', function($q, $http, sp) {
               return $http.get('/Mvs/' + sp.cnvId + '/Rvws')
                .then(function(response) {
                   return response.data;
                });
            }],
            cnv: ['$q', '$http', '$stateParams', function($q, $http, sp) {
               return $http.get('/Mvs/' + sp.mvId)
                .then(function(response) {
                   console.log(response.data);
                   return response.data;
                });
            }]
         }
      });
   }]);
