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
  storeService
){
  var vm = this;
  vm.user = angular.copy($rootScope.user);
  vm.cashRegister       = {};
  vm.paymentsGroups     = [];
  vm.update             = update;
  vm.onSelectStartDate  = onSelectStartDate;
  vm.onSelectEndDate    = onSelectEndDate;
  vm.init               = init;
  vm.getCashReport      =  getCashReport;
  vm.getTotalByMethod   = getTotalByMethod;
  vm.getTotalByGroup    = getTotalByGroup;
  vm.getSellerTotal     = getSellerTotal;
  vm.getStoreTotal      = getStoreTotal;
  vm.print              = print;
  vm.isUserAdminOrManager     = authService.isUserAdminOrManager;

  if(vm.user.role.name === authService.USER_ROLES.BROKER){
    $location.path('/users/brokerprofile');
  }

  function init(){
    var role = $rootScope.user.role.name;
    if(role === authService.USER_ROLES.BROKER){
      $location.path('/users/brokerprofile');
    }
    var monthRange = commonService.getMonthDateRange();
    vm.cashRegister.startDate = moment().startOf('day');
    vm.cashRegister.endDate = moment().endOf('day');
    vm.cashRegister.startTime = moment().startOf('day');
    vm.cashRegister.endTime = moment().endOf('day');
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

  function onSelectStartDate(pikaday){
    vm.cashRegister.startDate = pikaday._d;
    vm.myPickerEndDate.setMinDate(vm.cashRegister.startDate);
  }

  function onSelectEndDate(pikaday){
    vm.cashRegister.endDate = pikaday._d;
    vm.myPickerStartDate.setMaxDate(vm.cashRegister.endDate);
  }

  function getCashReport(){
    vm.cashRegister.startDate = commonService.combineDateTime(vm.cashRegister.startDate,vm.cashRegister.startTime);
    vm.cashRegister.endDate = commonService.combineDateTime(vm.cashRegister.endDate,vm.cashRegister.endTime,59);
    
    var params = {
      startDate: vm.cashRegister.startDate,
      endDate: vm.cashRegister.endDate
    };


    var promises = [
      storeService.getCashReport(vm.user.mainStore.id, params),
      paymentService.getPaymentMethodsGroups(),
    ];

    vm.isLoadingReport = true;

    $q.all(promises)
      .then(function(results){
        vm.sellers = results[0].data;
        var paymentsGroups = results[1].data;
        
        vm.sellers = vm.sellers.map(function(seller){
          seller.paymentsGroups = _.clone(paymentsGroups);
          seller.paymentsGroups = mapMethodGroupsWithPayments(seller.Payments, seller.paymentsGroups);
          return seller;
        });
      
        console.log('vm.sellers', vm.sellers);
        console.log('paymentsGroups', paymentsGroups);
        vm.isLoadingReport = false;
      });

  }

  function mapMethodGroupsWithPayments(payments, methodGroups){
    var groups = [];
    var auxGroups = _.groupBy(payments, function(payment){
      return payment.type + '#' + payment.terminal;
    });
    var methods = _.map(auxGroups, function(group){
      return {
        type: group[0].type,
        name: group[0].name,
        label: group[0].type,
        terminal: group[0].terminal,
        msi: group[0].msi,
        payments: group,
        groupNumber: group[0].group
      };
    });

    var paymentsGroups = _.groupBy(methods, 'groupNumber');
    for(var key in paymentsGroups){
      var sortedMethods = sortMethodsByGroup(paymentsGroups[key], key, methodGroups);
      groups.push({
        groupNumber: key,
        methods: sortedMethods
      });
    }
    
    return groups;
  }

  function sortMethodsByGroup(methods, groupNumber, methodGroups){
    var sorted = [];
    groupNumber = parseInt(groupNumber);
    var group = _.findWhere(methodGroups, {group: groupNumber});
    for(var i = 0; i< group.methods.length; i++){
      var matches = _.where(methods, {type: group.methods[i].type});
      if(matches && matches.length > 0){
        sorted = sorted.concat(matches);
      }      
    }
    return sorted;
  }

  function getTotalByMethod(method){
    var total = method.payments.reduce(function(acum, current){
      if(current.currency === 'usd'){
        acum += (current.ammount * current.exchangeRate);
      }else{
        acum += current.ammount;
      }
      return acum;
    },0);
    return total;
  }

  function getTotalByGroup(group){
    var total = group.methods.reduce(function(acum, method){
      return acum += getTotalByMethod(method);
    },0);
    return total;
  }

  function getStoreTotal(){
    var storeTotal = vm.sellers.reduce(function(acum, seller){
      acum += getSellerTotal(seller);
      console.log('acum',acum);
      return acum;
    }, 0);
    return storeTotal;
  }

  function getSellerTotal(seller){
    var generalTotal = seller.paymentsGroups.reduce(function(acum, group){
      acum += getTotalByGroup(group);
      return acum;
    },0);
    return generalTotal;
  }


  function showConfirm() {
    var confirm = $mdDialog.confirm()
      .title('¿Quieres cambiar tus datos?')
      .textContent('Este cambio no es reversible')
      .ok('Sí')
      .cancel('No');
    return $mdDialog.show(confirm);
  }

  function print(){
    $window.print();
  }

  init();

}
