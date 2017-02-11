function DepositController(
  $scope, 
  $mdDialog, 
  $filter,
  formatService, 
  commonService, 
  ewalletService,
  dialogService,
  payment
) {

  $scope.init = function(){
    $scope.payment = payment;
    $scope.needsVerification = payment.needsVerification;
    $scope.maxAmmount = (payment.maxAmmount >= 0) ? payment.maxAmmount : false;

    if($scope.payment.currency === 'usd'){
      $scope.payment.ammount = $scope.payment.ammount / $scope.payment.exchangeRate;
      $scope.payment.ammountMXN = $scope.getAmmountMXN($scope.payment.ammount);
    
      if($scope.maxAmmount){
        $scope.payment.maxAmmount = $scope.maxAmmount / $scope.payment.exchangeRate;
        $scope.maxAmmount = $scope.payment.maxAmmount;
      }
    }

    //ROUNDING
    if(payment.type !== ewalletService.ewalletType){ 
      $scope.payment.remaining = commonService.roundCurrency($scope.payment.remaining); 
      $scope.payment.ammount = commonService.roundCurrency($scope.payment.ammount);
      $scope.maxAmmount = commonService.roundCurrency($scope.maxAmmount);
    }

  };

  $scope.getAmmountMXN = function(ammount){
    return ammount * $scope.payment.exchangeRate;
  };

  $scope.isValidPayment = function(){
    $scope.errMsg = '';
    if($scope.maxAmmount){
      if($scope.payment.ammount <= $scope.maxAmmount){
        return true;
      }else{
        $scope.errMsg = 'Favor de aplicar el saldo total';
        return false;
      }
    }
    return true;
  };

  $scope.hide = function() {
    $mdDialog.hide();
  };
  
  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.save = function() {
    if( $scope.isValidPayment() ){
      $mdDialog.hide($scope.payment);
    }
  };

  $scope.init();
}