
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
            }],
            rvws: [function() {
               return null;
            }]
         }
      })
      .state('myMvOverview', {
         url: '/myMvs/:usrId',
         templateUrl: 'Movie/mvOverview.template.html',
         controller: 'mvOverviewController',
         params: {myMovie: true},
         resolve: {
            mvs: ['$q', '$http', '$stateParams', function($q, $http, sp) {
               return $http.get('/Mvs' + (sp.usrId ?
                '?owner=' + sp.usrId : ''))
                .then(function(response) {
                   return response.data;
                });
            }],
            rvws: [function() {
               return null;
            }]
         }
      })
      .state('myMvRvwsOverview', {
         url: '/myMvRvws/:usrId',
         templateUrl: 'Movie/mvOverview.template.html',
         controller: 'mvOverviewController',
         resolve: {
            mvs: ['$q', '$http',  function($q, $http) {
               return $http.get('/Mvs')
                .then(function(response) {
                   return response.data;
                });
            }],
            rvws: ['$q', '$http', '$stateParams', function($q, $http, sp) {
               return $http.get('/Usrs/Rvws/' + sp.usrId)
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
            rvws: ['$q', '$http', '$stateParams', function($q, $http, sp) {
               return $http.get('/Mvs/' + sp.mvId + '/Rvws')
                .then(function(response) {
                   return response.data;
                });
            }],
            mv: ['$q', '$http', '$stateParams', function($q, $http, sp) {
               return $http.get('/Mvs/' + sp.mvId)
                .then(function(response) {
                   console.log(response.data);
                   return response.data;
                });
            }]
         }
      });
   }]);
