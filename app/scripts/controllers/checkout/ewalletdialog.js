function EwalletDialogController(
  $scope,
  $mdDialog,
  $location,
  $timeout,
  ewalletService,
  dialogService,
  client,
  ewallet,
  type
) {
  console.log('TYPE: ', type);
  console.log('CLIENT: ', client);
  console.log('EWALLET: ', ewallet);

  $scope.getEwallet = ewalletService.getEwallet;
  $scope.showDialog = dialogService.showDialog;
  $scope.initScan = ewalletService.initScan;

  $scope.scanEwallet = function() {
    if (ewallet != null) {
      console.log('ewallet null');
      return;
    }
    $scope.initScan();
    Quagga.onDetected(function(result) {
      console.log('dialog detected');
      var code = result.codeResult.code;
      console.log('CODE RESULT: ', code);
      if (type == 'show') Quagga.offDetected();
      $scope
        .getEwallet(code, client, type)
        .then(function(ewallet) {
          if (type != 'show') Quagga.offDetected();
          $mdDialog.hide(ewallet);
        })
        .catch(function(err) {
          console.log('err', err);
          $scope.err = err.data;
        });
    });
  };

  $timeout($scope.scanEwallet, 1000);

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
