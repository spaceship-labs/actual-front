function EwalletDialogController(
  $scope,
  $mdDialog,
  $location,
  ewalletService,
  dialogService,
  client
) {
  $scope.getEwallet = ewalletService.getEwallet;
  $scope.showDialog = dialogService.showDialog;

  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.save = function() {
    $scope
      .getEwallet($scope.cardNumber, client)
      .then(function(ewallet) {
        $mdDialog.hide(ewallet);
      })
      .catch(function(err) {
        console.log('err', err);
        $scope.err = err.data;
      });
  };
}
