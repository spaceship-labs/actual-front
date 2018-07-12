(function() {
  'use strict';

  angular.module('actualApp').factory('authService', authService);

  /** @ngInject */
  function authService(
    $http,
    $rootScope,
    $location,
    localStorageService,
    dialogService,
    api,
    jwtHelper,
    userService
  ) {
    var USER_ROLES = {
      ADMIN: 'admin',
      BROKER: 'broker',
      SELLER: 'seller',
      STORE_MANAGER: 'store manager'
    };

    var service = {
      authManager: authManager,
      signUp: signUp,
      signIn: signIn,
      logout: logout,
      dennyAccessBroker: dennyAccessBroker,
      dennyAccessStoreManager: dennyAccessStoreManager,
      isBroker: isBroker,
      isStoreManager: isStoreManager,
      isAdmin: isAdmin,
      isUserAdminOrManager: isUserAdminOrManager,
      isUserSellerOrAdmin: isUserSellerOrAdmin,
      isUserManager: isUserManager,
      isSeller: isSeller,
      runPolicies: runPolicies,
      showUnauthorizedDialogIfNeeded: showUnauthorizedDialogIfNeeded,
      USER_ROLES: USER_ROLES,
      isUserSignedIn: isUserSignedIn
    };

    return service;

    function isUserSignedIn() {
      var user = localStorageService.get('user');
      return user ? true : false;
    }

    function showUnauthorizedDialogIfNeeded(err) {
      if (err.status === 401) {
        dialogService.showDialog('Usuario no autorizado');
        return;
      }
    }

    function signUp(data, success, error) {
      $http
        .post(api.baseUrl + '/user/create', data)
        .then(success)
        .catch(error);
    }

    function signIn(data, success, error) {
      localStorageService.remove('token');
      localStorageService.remove('user');
      localStorageService.remove('quotation');
      localStorageService.remove('broker');
      $http
        .post(api.baseUrl + '/auth/signin', data)
        .then(success)
        .catch(error);
    }

    function authManager(params) {
      var url = '/auth/manager';
      return api.$http.post(url, params);
    }

    function logout(successCB) {
      localStorageService.remove('token');
      localStorageService.remove('user');
      localStorageService.remove('quotation');
      localStorageService.remove('broker');
      localStorageService.remove('activeStore');
      localStorageService.remove('companyActive');
      localStorageService.remove('companyActiveName');
      localStorageService.remove('currentQuotation');
      delete $rootScope.user;
      if (successCB) {
        successCB();
      }
    }

    function dennyAccessBroker() {
      var _user = localStorageService.get('user');
      if (isBroker(_user)) {
        $location.path('/');
      }
    }

    function dennyAccessStoreManager() {
      var _user = localStorageService.get('user');
      if (isStoreManager(_user)) {
        $location.path('/');
      }
    }

    function isBroker(user) {
      return !!(user && user.role && user.role.name === USER_ROLES.BROKER);
    }

    function isStoreManager(user) {
      return user && user.role && user.role.name === USER_ROLES.STORE_MANAGER;
    }

    function isAdmin(user) {
      return user && user.role && user.role.name === USER_ROLES.ADMIN;
    }

    function isSeller(user) {
      return user && user.role && user.role.name === USER_ROLES.SELLER;
    }

    function isUserAdminOrManager() {
      return (
        $rootScope.user.role &&
        ($rootScope.user.role.name === USER_ROLES.ADMIN ||
          $rootScope.user.role.name === USER_ROLES.STORE_MANAGER)
      );
    }

    function isUserSellerOrAdmin() {
      return (
        $rootScope.user.role &&
        ($rootScope.user.role.name === USER_ROLES.ADMIN ||
          $rootScope.user.role.name === USER_ROLES.SELLER)
      );
    }

    function isUserManager() {
      return (
        $rootScope.user.role.name === USER_ROLES.STORE_MANAGER &&
        $rootScope.user.mainStore
      );
    }

    function runPolicies() {
      var publicPaths = [
        '/',
        '/forgot-password',
        '/reset-password',
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

      var storeManagerForbiddenPaths = [
        '/addquotation',
        '/dashboard',
        //'/checkout/client',
        //'/checkout/paymentmethod',
        '/continuequotation'
      ];

      var brokerForbiddenPaths = [
        '/clients/list',
        '/quotations/list',
        '/dashboard',
        '/checkout/client',
        '/checkout/paymentmethod',
        '/continuequotation',
        '/addquotation'
      ];

      var isPublicPath = function(path) {
        return publicPaths.indexOf(path) > -1;
      };

      var isStoreManagerForbiddenPath = function(path) {
        var result = _.some(storeManagerForbiddenPaths, function(
          forbiddenPath
        ) {
          return path.search(forbiddenPath) > -1;
        });
        return result;
      };

      var isBrokerForbiddenPath = function(path) {
        var result = _.some(brokerForbiddenPaths, function(forbiddenPath) {
          return path.search(forbiddenPath) > -1;
        });
        return result;
      };

      var token = localStorageService.get('token') || false;
      var user = localStorageService.get('user') || false;
      var currentPath = $location.path();

      if (token) {
        //Check if token is expired
        var expiration = jwtHelper.getTokenExpirationDate(token);
        if (expiration <= new Date()) {
          return logout(function() {
            $location.path('/');
          });
        }

        if (
          user.role.name === USER_ROLES.STORE_MANAGER &&
          isStoreManagerForbiddenPath(currentPath)
        ) {
          return $location.path('/');
        } else if (
          user.role.name === USER_ROLES.BROKER &&
          isBrokerForbiddenPath(currentPath)
        ) {
          return $location.path('/');
        }

        //Gets user from API and save it to local storage
        return saveMostRecentUserInfoToStorage(user);
      } else {
        logout();
        if (!isPublicPath(currentPath)) {
          $location.path('/');
        }
      }
    }

    function saveMostRecentUserInfoToStorage(user) {
      return userService
        .getUser(user.id, { quickRead: true })
        .then(function(res) {
          user = res.data.data;
          localStorageService.set('user', user);
          $rootScope.user = user;
          return true;
        })
        .catch(function(err) {
          console.log('err saveMostRecentUserInfoToStorage', err);
        });
    }
  }
})();
