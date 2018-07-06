function EwalletDialogController($scope, $mdDialog, $location) {
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
}
