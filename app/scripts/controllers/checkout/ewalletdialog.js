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
      Quagga.offDetected();
      var code = result.codeResult.code;

      $scope
        .getEwallet(code, client, type)
        .then(function(ewallet) {
          Quagga.stop();
          $mdDialog.hide(ewallet);
        })
        .catch(function(err) {
          $scope.err = err.data;
          Quagga.stop();
          $mdDialog.cancel(err.data);
        });
    });
  };

  $timeout($scope.scanEwallet, 1000);

  $scope.cancel = function() {
    Quagga.stop();

    $mdDialog.cancel();
  };
  $scope.hide = function() {
    Quagga.stop();

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
