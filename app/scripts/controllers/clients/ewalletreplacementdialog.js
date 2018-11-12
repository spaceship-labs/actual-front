'use strict';
angular
  .module('actualApp')
  .controller(
    'ClientsEwalletreplacementdialogCtrl',
    ClientsEwalletreplacementdialogCtrl
  );

function ClientsEwalletreplacementdialogCtrl(
  $scope,
  $mdDialog,
  $location,
  $timeout,
  ewalletService,
  dialogService,
  client
) {
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.hide = function() {
    $mdDialog.hide();
  };
}
