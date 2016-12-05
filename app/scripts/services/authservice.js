(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('authService', authService);

    /** @ngInject */
    function authService(
      $http,
      $rootScope,
      $location,
      localStorageService, 
      api,
      jwtHelper,
      userService
    ){

      var service = {
        authManager: authManager,
        signUp: signUp,
        signIn: signIn,
        logout: logout,
        dennyAccessBroker: dennyAccessBroker,
        dennyAccessStoreManager: dennyAccessStoreManager,
        isBroker: isBroker,
        runPolicies: runPolicies
      };

      return service;


      function signUp(data, success, error) {
         $http.post(api.baseUrl + '/user/create', data).success(success).error(error);
      }

      function signIn(data, success, error) {
        localStorageService.remove('token');
        localStorageService.remove('user');
        localStorageService.remove('quotation');
        localStorageService.remove('broker');
        $http.post(api.baseUrl + '/auth/signin', data).success(success).error(error);
      }

      function authManager(params){
        var url = '/auth/manager';
        console.log(url);
        return api.$http.post(url, params);
      }

      function logout(successCB) {
        localStorageService.remove('token');
        localStorageService.remove('user');
        localStorageService.remove('quotation');
        localStorageService.remove('broker');
        localStorageService.remove('activeStore');
        localStorageService.remove('activeStoreName');
        localStorageService.remove('companyActive');
        localStorageService.remove('companyActiveName');
        localStorageService.remove('currentQuotation');
        delete $rootScope.user;
        if(successCB){
          successCB();
        }
      }

      function dennyAccessBroker(){
        var _user = localStorageService.get('user');
        if( isBroker(_user) ){
          $location.path('/');
        }
      }

      function dennyAccessStoreManager(){
        var _user = localStorageService.get('user');
        if( isStoreManager(_user) ){
          $location.path('/');
        }
      }

      function isBroker(user){
        return !!(user && user.role && user.role.name == 'broker');
      }

      function isStoreManager(user){
        return !!(user && user.role && user.role.name == 'store manager');
      }

      function runPolicies(){
        var _token = localStorageService.get('token') || false;
        var _user  = localStorageService.get('user')  || false;
        var currentPath = $location.path();
        var publicPaths = [
          '/',
          '/politicas-de-entrega',
          '/politicas-de-garantia',
          '/politicas-de-almacenaje',
          '/politicas-de-instalacion-y-ensamble',
          '/manual-de-cuidados-y-recomendaciones/pieles',
          '/manual-de-cuidados-y-recomendaciones/aceros',
          '/manual-de-cuidados-y-recomendaciones/aluminios',
          '/manual-de-cuidados-y-recomendaciones/cristales',
          '/manual-de-cuidados-y-recomendaciones/cromados',
          '/manual-de-cuidados-y-recomendaciones',
          '/manual-de-cuidados-y-recomendaciones/maderas',
          '/manual-de-cuidados-y-recomendaciones/piezas-plasticas',
          '/manual-de-cuidados-y-recomendaciones/textiles',
          '/manual-de-cuidados-y-recomendaciones/viniles',
          '/manual-de-cuidados-y-recomendaciones/vinilos',
          '/manual-de-cuidados-y-recomendaciones/pintura-electrostatica'
        ];
        var isPublicPath = function(path){
          return publicPaths.indexOf(path) > -1;
        };

        //console.log('location',$location.path());
        //console.log('user', _user);

        //Check if token is expired
        if(_token){
            var expiration = jwtHelper.getTokenExpirationDate(_token);
            if(expiration <= new Date()){
              logout(function(){
                $location.path('/');
              });
            }else{
              userService.getUser(_user.id).then(function(res){
                _user = res.data.data;
                localStorageService.set('user', _user);
                $rootScope.user = _user;
              });
            }
        }else{
          logout();
          if(!isPublicPath(currentPath)){
            $location.path('/');
          }
        }
      }      

    }
})();
