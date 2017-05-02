function DepositController(
  $scope, 
  $mdDialog, 
  $filter,
  formatService, 
  commonService, 
  ewalletService,
  dialogService,
  paymentService,
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

  $scope.isCardPayment = function(payment){
    return ( payment.terminals && !$scope.isTransferPayment(payment) && !$scope.isDepositPayment(payment))  
      || payment.type === 'single-payment-terminal';
  };  

  $scope.isTransferPayment = function(payment){
    return payment.type === 'transfer';
  };

  $scope.isDepositPayment = function(payment){
    return payment.type === 'deposit';
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
  
  $scope.openConfirmation = function(){
    $scope.isConfirmationActive = true;
  };

  $scope.cancel = function(){
    $scope.isConfirmationActive = false;
  };

  $scope.save = function() {
    if( $scope.isValidPayment() ){
      $mdDialog.hide($scope.payment);
    }else{
      $scope.isConfirmationActive = false;
    }
  };

  $scope.init();
}