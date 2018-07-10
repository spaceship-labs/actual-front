'use strict';

/**
 * @ngdoc function
 * @name actualApp.controller:EwalletCtrl
 * @description
 * # EwalletCtrl
 * Controller of the actualApp
 */

angular.module('actualApp').controller('EwalletCtrl', EwalletCtrl);

function EwalletCtrl(
  $filter,
  $location,
  $q,
  $rootScope,
  $routeParams,
  $timeout,
  ewalletService
) {
  var vm = this;
  vm.getEwallet = getEwallet;
  vm.ewallet = null;
  vm.foo = 'foo';

  function getEwallet() {
    console.log('vm.cardNumber: ', vm.cardNumber);
    ewalletService
      .getEwallet(vm.cardNumber)
      .then(function(ewallet) {
        console.log('EWALLET', ewallet);
        vm.ewallet = ewallet;
      })
      .catch(function(err) {
        console.log('err', err);
      });
  }
}
