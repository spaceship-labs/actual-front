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
  ewalletService,
  dialogService,
  paymentService
) {
  var vm = this;
  vm.getEwallet = getEwallet;
  vm.ewallet = null;

  vm.scanEwallet = function() {
    ewalletService.initScan();
    Quagga.onDetected(function(result) {
      var code = result.codeResult.code;
      console.log('CODE RESULT: ', code);
      ewalletService
        .getEwalletSingle(code)
        .then(function(ewallet) {
          console.log('EWALLET', ewallet);
          vm.ewallet = ewallet;
          vm.ewallet.amount = parseFloat(vm.ewallet.amount.toFixed(2));
          vm.ewallet.mxnAmount = paymentService.pointsToMXN(
            vm.ewallet.amount,
            vm.ewallet.exchangeRate
          );
        })
        .catch(function(err) {
          console.log('err monedero', err);
          dialogService.showDialog(err.data);
        });
    });
  };

  function init() {
    $timeout(vm.scanEwallet, 1000);
  }

  init();

  function getEwallet() {
    console.log('vm.cardNumber: ', vm.cardNumber);
    ewalletService
      .getEwalletSingle(vm.cardNumber)
      .then(function(ewallet) {
        console.log('EWALLET JIJI', ewallet);
        vm.ewallet = ewallet;
        vm.ewallet.amount = parseFloat(vm.ewallet.amount.toFixed(2));
      })
      .catch(function(err) {
        console.log('err monedero', err);
        dialogService.showDialog(err.data);
      });
  }
}
