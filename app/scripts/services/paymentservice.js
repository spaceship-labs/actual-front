(function (){
  'use strict';

  angular
    .module('actualApp')
    .factory('paymentService', paymentService);

  function paymentService(
    api, 
    $filter, 
    $http, 
    commonService, 
    clientService, 
    ewalletService,
    paymentOptionsConfig
  ){
    var paymentOptions = paymentOptionsConfig.getAll();
    var CLIENT_BALANCE_GROUP_INDEX = 0;
    var CLIENT_BALANCE_TYPE = 'client-balance';

    var currencyTypes = {
      USD: 'usd',
      MXN: 'mxn'
    };

    var types = {
      CLIENT_BALANCE: 'client-balance',
      CASH: 'cash',
      CASH_USD: 'cash-usd',
      CHEQUE: 'cheque',
      DEPOSIT: 'deposit',
      TRANSFER: 'transfer',
      TRANSFER_USD: 'transfer-usd',
      CREDIT_CARD: 'credit-card',
      DEBIT_CARD: 'debit-card',
      SINGLE_PAYMENT_TERMINAL: 'single-payment-terminal',
      MSI_3: '3-msi',
      MSI_6: '6-msi',
      MSI_9: '9-msi',
      MSI_12: '12-msi',

      MSI_3_BANAMEX: '3-msi-banamex',
      MSI_6_BANAMEX: '6-msi-banamex',
      MSI_9_BANAMEX: '9-msi-banamex',
      MSI_12_BANAMEX: '12-msi-banamex',

      MSI_13: '13-msi',
      MSI_18: '18-msi'
    };

    var service = {
      addPayment: addPayment,
      cancelPayment: cancelPayment,
      getAmountMXN: getAmountMXN,
      getPaymentMethodsGroups: getPaymentMethodsGroups,
      getPaymentWebMethodsGroups: getPaymentWebMethodsGroups,
      getMethodAvailableBalance: getMethodAvailableBalance,
      getPaymentOptionsByMethod: getPaymentOptionsByMethod,
      getPaymentTypeString: getPaymentTypeString,
      getClientBalanceDescription: getClientBalanceDescription,
      updateQuotationClientBalance: updateQuotationClientBalance,
      types: types,
      currencyTypes: currencyTypes,
      isUsdPayment: isUsdPayment,
      isTransferOrDeposit: isTransferOrDeposit,
      isSinglePlaymentTerminal: isSinglePlaymentTerminal,
      isDepositPayment: isDepositPayment,
      isTransferPayment: isTransferPayment,
      isCardPayment: isCardPayment
    };

    function getAmountMXN(amount, exchangeRate){
      return amount * exchangeRate;      
    }

    function isCardPayment(payment){
      return payment.msi || payment.type === types.CREDIT_CARD || payment.type === types.DEBIT_CARD || 
      payment.type === types.SINGLE_PAYMENT_TERMINAL;
    }

    function isUsdPayment(payment){
      return payment.currency === currencyTypes.USD;
    }

    function isDepositPayment(payment){
      return payment.type === types.DEPOSIT;
    }

    function isTransferPayment(payment){
      return payment.type === types.TRANSFER || 
        payment.type === types.TRANSFER_USD 
    }
  
    function isTransferOrDeposit(payment){
      return payment.type === types.TRANSFER || 
        payment.type === types.TRANSFER_USD || 
        payment.type === types.DEPOSIT;
    }

    function isSinglePlaymentTerminal(payment){
      return payment.type === types.SINGLE_PAYMENT_TERMINAL || 
        payment.type === types.DEBIT_CARD || 
        payment.type === types.CREDIT_CARD;
    }
	
    function getPaymentOptionsByMethod(method){
      var options = _.filter(paymentOptions, function(option){
        var hasPaymentType = false;
        var hasStore = false;
        option.isInternational = !_.isUndefined(option.isInternational) ? option.isInternational : false;
        method.isInternational = !_.isUndefined(method.isInternational) ? method.isInternational : false;
        
        if(option.paymentTypes.indexOf(method.type) > -1){
          hasPaymentType = true;
        }

        if(option.storesTypes.indexOf(method.storeType) > -1 ){
          hasStore = true;
        }

        if(hasStore && 
          hasPaymentType &&
          method.isInternational === option.isInternational
        ){
          return true;
        }
        
        return false;
      });
      return options;
    }

    function getPaymentMethodsGroups(params){
      var url = '/paymentgroups';
      return api.$http.post(url, params);
    }

    function getPaymentWebMethodsGroups(params){
      var url = '/paymentwebgroups';
      return api.$http.post(url, params);
    }

    function addPayment(quotationId, params){
      var url = '/payment/add/' + quotationId;
      return api.$http.post(url,params);
    }

    function cancelPayment(quotationId, paymentId){
      var url = '/payment/cancel/' + quotationId + '/' + paymentId;
      return api.$http.post(url);
    }

    function getPaymentTypeString(payment){
      var type = '1 sola exhibición';
      if(payment.msi){
        type = payment.msi + ' meses sin intereses';
        return type;
      }
      else if(isTransferPayment(payment)){
        type = 'Transferencia';
      }
      else if(isDepositPayment(payment)){
        type = 'Deposito en ventanilla';
      }

      switch(payment.type){
        case types.CASH:
        case types.CASH_USD:
          type = 'Pago de contado';
          break;
        case types.EWALLET_TYPE:
          type = 'Monedero electrónico';
          break;
        case types.CLIENT_BALANCE:
          type = 'Saldo a favor cliente';
          break;
      } 
      return type;
    }

    //@param quotation - Object quotation populated with Payments and Client
    function updateQuotationClientBalance(quotation,paymentMethodsGroups){
      var group = paymentMethodsGroups[CLIENT_BALANCE_GROUP_INDEX];
      var balancePaymentMethod = _.findWhere(group.methods, {type:CLIENT_BALANCE_TYPE});
      var balancePayments = _.where(quotation.Payments, {type:CLIENT_BALANCE_TYPE});
      clientService.getBalanceById(quotation.Client.id)
        .then(function(res){
          console.log('res', res);
          var balance = res.data || 0;
          var description = getClientBalanceDescription(balance);
          if(balancePaymentMethod){
            balancePaymentMethod.description = description;
          }
          if(balancePayments){
            balancePayments = balancePayments.map(function(payment){
              payment.description = description;
              return payment;
            });
          }
        })
        .catch(function(err){
          console.log(err);
        });
    }

    function getMethodAvailableBalance(method, quotation){
      var EWALLET_TYPE = ewalletService.ewalletType;
      var balance = 0;

      if(method.type === EWALLET_TYPE || method.type === CLIENT_BALANCE_TYPE){
        if(method.type === EWALLET_TYPE){
          balance = quotation.Client.ewallet;
        }
        else if(method.type === CLIENT_BALANCE_TYPE){
          balance = quotation.Client.Balance;
        }
      }
      return balance;
    }

    function getClientBalanceDescription(balance){
      var description = '';
      var balanceRounded = commonService.roundCurrency( balance, {up:false} );
      var balanceStr = $filter('currency')(balanceRounded);
      description = 'Saldo disponible: ' + balanceStr +' MXN';    
      return description;
    }        

  
    return service;
  }

})();
