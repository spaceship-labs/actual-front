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
  $scope.showDialog = dialogService.showDialog;

  $scope.attachImage = function(file) {
    console.log('whuuut: ', $scope.replacement);
    $scope.replacement = file;
    console.log('whuuut x2: ', $scope.replacement);
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
        .addFile(client, params)
        .then(function(res) {
          $scope.isLoading = false;
          var record = res.data;
          if (record) {
            $scope.showDialog('Archivo guardado');
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
