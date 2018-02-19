function TerminalController(
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

    $scope.payment.options = paymentService.getPaymentOptionsByMethod($scope.payment);
    console.log('$sopcpepayment options', $scope.payment.options);

    if($scope.payment.currency === 'usd'){
      $scope.payment.ammount = $scope.payment.ammount / $scope.payment.exchangeRate;
      $scope.payment.ammountMXN = $scope.getAmmountMXN($scope.payment.ammount);
    
      if($scope.maxAmmount){
        $scope.payment.maxAmmount = $scope.maxAmmount / $scope.payment.exchangeRate;
        $scope.maxAmmount = $scope.payment.maxAmmount;
      }
    }


    //ROUNDING
    $scope.payment.ammount = commonService.roundCurrency($scope.payment.ammount);     
    $scope.payment.remaining = commonService.roundCurrency($scope.payment.remaining); 
    if($scope.maxAmmount){
      $scope.maxAmmount = commonService.roundCurrency($scope.maxAmmount);
    }
    if($scope.payment.min){
      $scope.payment.min = commonService.roundCurrency($scope.payment.min);      
    }

    console.log('$scope.payment.min', $scope.payment.min);
  };

  $scope.numToLetters = function(num){
    return formatService.numberToLetters(num);
  };

  $scope.getAmmountMXN = function(ammount){
    return ammount * $scope.payment.exchangeRate;
  };

  $scope.isCardPayment = function(payment){
    return ( payment.terminals && payment.type !== 'transfer' && payment.type !== 'deposit')  
      || payment.type === 'single-payment-terminal';
  };

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.isMinimumValid = function(){
    $scope.payment.min = $scope.payment.min || 0;   
    if($scope.payment.ammount === $scope.payment.remaining){
      $scope.errMsg = '';
      return true;
    }
    else if( ($scope.payment.remaining - $scope.payment.ammount) >= $scope.payment.min && 
      $scope.payment.ammount >= $scope.payment.min
    ){
      $scope.errMsg = '';
      return true;
    }
    
    if($scope.remaining < $scope.payment.min){
      $scope.errMsg = 'El monto mínimo para esta forma de pago es '+$filter('currency')($scope.payment.min)+' pesos.';
    }
    else if($scope.payment.ammount < $scope.payment.min){
      $scope.errMsg = 'El monto mínimo para esta forma de pago es '+$filter('currency')($scope.payment.min)+' pesos.';
    }
    else{
      $scope.errMsg = 'Favor de aplicar el saldo total';
    }
    return false;
  }; 

  $scope.$watch('payment.ammount', function(newVal, oldVal){
    if(newVal !== oldVal){
      $scope.isMinimumValid();
    }
  });

  function isValidVerificationCode(){
    if($scope.payment.type !== 'deposit'){
      return $scope.payment.verificationCode && $scope.payment.verificationCode !== '';
    }
    return true;
  }

  $scope.isValidPayment = function(){
    $scope.payment.min = $scope.payment.min || 0;
    if($scope.payment.ammount < $scope.payment.min){
      $scope.minStr = $filter('currency')($scope.payment.min);
      $scope.errMsg = 'La cantidad minima es: ' +  $scope.minStr;
    }else{
      $scope.errMin = false;        
    }

    if( $scope.maxAmmount ){
      return (
        $scope.isMinimumValid() &&
        ($scope.payment.ammount <= $scope.maxAmmount) &&
        isValidVerificationCode() &&
        $scope.payment.ammount >= $scope.payment.min
      );
    }
    return (
      $scope.payment.ammount && 
      isValidVerificationCode() &&
      $scope.payment.ammount >= $scope.payment.min        
    );
  };

  $scope.onChangeCard = function(card){
    $scope.terminal = getSelectedTerminal(card);
  };

  $scope.onChangePaymentNation = function(payment){
    $scope.payment.card = null;
    $scope.terminal = null;
    $scope.payment.options = [];
    $scope.payment.options = paymentService.getPaymentOptionsByMethod(payment);  
    console.log('$scope.payment.options', $scope.payment.options);
  };

  $scope.isTransferPayment = function(payment){
    return payment.type === 'transfer' || payment.type === 'transfer-usd';
  };  

  function getSelectedTerminal(card){
    var option = _.find($scope.payment.options, function(option){
      return option.card.value === card;
    });
    if(option){
      return option.terminal;
    }
    return false;
  }

  $scope.openConfirmation = function(){
    $scope.isConfirmationActive = true;
  };

  $scope.cancel = function(){
    $scope.isConfirmationActive = false;
  };

  $scope.save = function() {
    if( $scope.isValidPayment() ){
      if($scope.payment.options.length > 0){
        $scope.terminal = getSelectedTerminal($scope.payment.card);
        $scope.payment.terminal = $scope.terminal.value;
      }        
      //alert('cumple');
      console.log('$scope.payment save', $scope.payment);
      $mdDialog.hide($scope.payment);
    }
    else{
      console.log('no cumple');
      $scope.isConfirmationActive = false;
    }
  };

  $scope.init();
}