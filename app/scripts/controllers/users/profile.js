'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:UserProfileCtrl
 * @description
 * # UserProfileCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('UserProfileCtrl', UserProfileCtrl);

function UserProfileCtrl(
  $rootScope, 
  $q,
  $window, 
  $location, 
  $mdDialog, 
  commonService, 
  userService,
  authService, 
  localStorageService,
  paymentService,
  storeService,
  dialogService
){
  var vm = this;
  angular.extend(vm, {
    user: angular.copy($rootScope.user),
    cashRegister: {},
    paymentsGroups: [],
    init: init,
    isAdmin: authService.isAdmin,
    isSinglePlaymentTerminal : paymentService.isSinglePlaymentTerminal,
    isStoreManager: authService.isStoreManager,
    isTransferOrDeposit: paymentService.isTransferOrDeposit,
    isUsdPayment: paymentService.isUsdPayment,
    isUserAdminOrManager: authService.isUserAdminOrManager,
    paymentTypes: paymentService.types,
    update: update,
    storeFilter: 'all'

  });

  if(vm.user.role.name === authService.USER_ROLES.BROKER){
    $location.path('/users/brokerprofile');
  }

  function init(){
    var role = $rootScope.user.role.name;
    if(role === authService.USER_ROLES.BROKER){
      $location.path('/users/brokerprofile');
    }
  }

  function update(form){
    if(form.$valid){
      showConfirm().then(function(ok) {
        if (!ok) {return;}
        vm.isLoading = true;
        userService.update(vm.user).then(function(res){
          vm.isLoading = false;
          commonService.showDialog('Datos actualizados');
          if(res.data.id){
            $rootScope.user = res.data;
            vm.user = $rootScope.user;
            localStorageService.set('user',res.data);
          }
        });
      });
    }
  }

  function showConfirm() {
    var confirm = $mdDialog.confirm()
      .title('¿Quieres cambiar tus datos?')
      .textContent('Este cambio no es reversible')
      .ok('Sí')
      .cancel('No');
    return $mdDialog.show(confirm);
  }

  init();

}
