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
  client,
  mode
) {
  $scope.showDialog = dialogService.showDialog;

  $scope.attachImage = function(file) {
    $scope.replacement = file;
  };

  $scope.addFile = function() {
    if (!$scope.replacement) {
      $scope.showDialog('No se ha adjuntado ningún archivo');
    } else {
      var params = {
        file: $scope.replacement,
      };
      $scope.isLoading = true;
      ewalletService
        .addFile(client, mode, params)
        .then(function(res) {
          var record = res.data;
          if (record) {
            $scope.isLoading = false;
            $scope.hide();
          }
        })
        .catch(function(err) {
          console.log('err', err);
          $scope.err = err.data;
        });
    }
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.hide = function() {
    $mdDialog.hide();
  };
}
