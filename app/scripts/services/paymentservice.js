(function (){
  'use strict';

  angular
    .module('dashexampleApp')
    .factory('paymentService', paymentService);

  function paymentService(api, $filter, $http, commonService, clientService, ewalletService){
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
      getPaymentMethodsGroups: getPaymentMethodsGroups,
      getMethodAvailableBalance: getMethodAvailableBalance,
      getPaymentOptionsByMethod: getPaymentOptionsByMethod,
      getPaymentTypeString: getPaymentTypeString,
      getRefundsOptions: getRefundsOptions,
      updateQuotationClientBalance: updateQuotationClientBalance,
      clientBalanceType: CLIENT_BALANCE_TYPE,
      types: types,
      currencyTypes: currencyTypes,
      isUsdPayment: isUsdPayment,
      isTransferOrDeposit: isTransferOrDeposit,
      isSinglePlaymentTerminal: isSinglePlaymentTerminal
    };

    function isUsdPayment(payment){
      return payment.currency === currencyTypes.USD;
    }

    function isTransferOrDeposit(payment){
      return payment.type === types.TRANSFER || payment.type === types.DEPOSIT;
    }

    function isSinglePlaymentTerminal(payment){
      return payment.type === types.SINGLE_PAYMENT_TERMINAL;
    }

    var refundsOptions = [
      {
        name:'Reembolso a cuenta de cliente',
        label: 'Reembolso a cuenta de cliente',
        description: 'Descripción',
        type:'refund-to-account',
        currency: 'mxn'
      },
      {
        name: 'Reembolso en efectivo',
        label: 'Reembolso en efectivo',
        description: 'Descripción',
        type: 'cash-refund',
        currency: 'mxn'
      }
    ];

   	var paymentsOptions = [
      //MASTER CARD(International)
      {
        card: {label:'Master Card', value:'master-card'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        isInternational: true,
        terminal: {label:'Banamex', value:'banamex'}
      },

      //VISA(International)
      {
        card: {label:'Visa', value:'visa'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        isInternational: true,
        terminal: {label:'Banamex', value:'banamex'}
      },


      //AMERICAN EXPRESS (International)
      {
        card: {label:'American Express', value:'american-express'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        isInternational: true,
        terminal: {label:'American Express', value:'american-express'}
      },

      //AMERICAN EXPRESS
      {
        card: {label:'American Express', value:'american-express'},
        paymentTypes: ['single-payment-terminal','3-msi','6-msi','9-msi','12-msi','18-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'American Express', value:'american-express'}
      },

      //BANAMEX
      {
        card:{label:'Banamex', value:'banamex'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}
      },

      {
        card:{label:'Banamex', value:'banamex'},
        paymentTypes: ['3-msi-banamex','6-msi-banamex','9-msi-banamex', '12-msi-banamex','13-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}
      },


      //SANTANDER
      {
        card:{label:'Santander', value:'santander'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}
      },         

      {
        card:{label:'Santander', value:'santander'},
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}
      },  

      //BANCOMER
      {
        card:{label:'Bancomer', value:'bancomer'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}
      },

      {
        card:{label:'Bancomer', value:'bancomer'},
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Bancomer', value:'bancomer'}        
      },

      //BANORTE
      {
        card:{label:'Banorte', value:'banorte'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Banorte', value:'banorte'},
        paymentTypes: ['3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}        
      },      

      //AFIRME
      {
        card:{label:'Afirme', value:'afirme'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Afirme', value:'afirme'},
        paymentTypes: ['3-msi','6-msi','9-msi', '12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}        
      }, 



      //BANBAJIO
      {
        card:{label:'Banbajio', value:'banbajio'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Banbajio', value:'banbajio'},
        paymentTypes: ['3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}        
      },      

      //BANCAMIFEL
      {
        card:{label:'Bancamifel', value:'bancamifel'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Bancamifel', value:'bancamifel'},
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}        
      }, 




      // BANCO AHORRO FAMSA
      {
        card:{label:'Banco Ahorro Famsa', value:'banco-ahorro-famsa'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Banco Ahorro Famsa', value:'banco-ahorro-famsa'},
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}        
      },

      //BANJERCITO
      {
        card:{label:'Banjercito', value:'banjercito'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Banjercito', value:'banjercito'},
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}        
      },



      //BANREGIO
      {
        card:{label:'Banregio', value:'banregio'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Banregio', value:'banregio'},
        paymentTypes: ['3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}        
      },

      //HSBC
      {
        card: {label:'HSBC', value:'hsbc'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}
      },

      {
        card: {label:'HSBC', value:'hsbc'},
        paymentTypes: ['3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}
      },
   		
   		//INBURSA
      {
        card:{label:'Inbursa', value:'inbursa'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Inbursa', value:'inbursa'},
        paymentTypes: ['3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}        
      },            
 		
      //INVEX
      {
        card:{label:'Invex Banco', value:'invex-banco'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Invex Banco', value:'invex-banco'},
        paymentTypes: ['3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}        
      },            


			//ITAUCARD
      {
        card:{label:'Itaucard', value:'itaucard'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Itaucard', value:'itaucard'},
        paymentTypes: ['3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}        
      },      

      //IXE
      {
        card:{label:'IXE', value:'ixe'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'IXE', value:'ixe'},
        paymentTypes: ['3-msi','6-msi','9-msi', '12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}        
      },  

      //LIVERPOOL
      {
        card:{label:'Liverpool Premium Card', value:'liverpool-premium-card'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Liverpool Premium Card', value:'liverpool-premium-card'},
        paymentTypes: ['3-msi','6-msi','9-msi', '12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}        
      }, 

    

      //SCOTIABANK
      {
        card:{label:'ScotiaBank', value:'scotiabank'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'ScotiaBank', value:'scotiabank'},
        paymentTypes: ['3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}        
      }, 

   	];
		

   	function getPaymentOptionsByMethod(method){

   		var options = _.filter(paymentsOptions, function(option){
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

    function getRefundsOptions(){
      return refundsOptions;
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
      if(payment.type === 'cash' || payment.type === 'cash-usd'){
        type = 'Pago de contado';
      }
      else if(payment.msi){
        type = payment.msi + ' meses sin intereses';
      }
      else if(payment.type === 'transfer'){
        type = 'Transferencia';
      }
      else if(payment.type === 'deposit'){
        type = 'Deposito en ventanilla';
      }
      else if(payment.type === 'ewallet'){
        type = 'Monedero electrónico';
      }
      else if(payment.type === 'client-balance'){
        type = 'Saldo a favor cliente';
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
          var description = getClientBalanceDescription(balance);;
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
