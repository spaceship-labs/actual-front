function EwalletDialogController($scope, $mdDialog, $location, ewalletService) {
  $scope.getEwallet = ewalletService.getEwallet;

  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.save = function() {
    $scope
      .getEwallet($scope.cardNumber)
      .then(function(ewallet) {
        $mdDialog.hide(ewallet);
      })
      .catch(function(err) {
        console.log('err', err);
      });
  };
}
