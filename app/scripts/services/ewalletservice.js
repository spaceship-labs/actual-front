(function() {
  'use strict';

  angular.module('actualApp').factory('ewalletService', ewalletService);

  /** @ngInject */
  function ewalletService($filter, clientService, commonService, api) {
    var EWALLET_TYPE = 'ewallet';
    var EWALLET_GROUP_INDEX = 0;

    var service = {
      ewalletType: EWALLET_TYPE,
      ewalletGroupIndex: EWALLET_GROUP_INDEX,
      updateQuotationEwalletBalance: updateQuotationEwalletBalance,
      getEwallet: getEwallet,
      getEwalletSingle: getEwalletSingle,
      getEwalletExchangeRate: getEwalletExchangeRate,
      initScan: initScan,
    };

    return service;

    //@param quotation - Object quotation populated with Payments and Client

    function getEwallet(cardNumber, client) {
      var url = '/ewallet/' + cardNumber + '/' + client;
      return api.$http.get(url).then(function(response) {
        return response.data;
      });
    }

    function getEwalletSingle(cardNumber) {
      var url = '/ewallet/' + cardNumber;
      return api.$http.get(url).then(function(response) {
        return response.data;
      });
    }

    function getEwalletExchangeRate() {
      var url = '/ewalletconfiguration';
      return api.$http.get(url).then(function(response) {
        return response.data;
      });
    }

    function updateQuotationEwalletBalance(quotation, paymentMethodsGroups) {
      var group = paymentMethodsGroups[EWALLET_GROUP_INDEX];
      var ewalletPaymentMethod = _.findWhere(group.methods, {
        type: EWALLET_TYPE,
      });
      var ewalletPayments = _.where(quotation.Payments, { type: EWALLET_TYPE });
      clientService
        .getEwalletById(quotation.Client.id)
        .then(function(res) {
          var balance = res.data || 0;
          var description = getEwalletDescription(balance);
          if (ewalletPaymentMethod) {
            ewalletPaymentMethod.description = description;
          }
          if (ewalletPayments) {
            ewalletPayments = ewalletPayments.map(function(payment) {
              payment.description = description;
              return payment;
            });
          }
        })
        .catch(function(err) {
          console.log(err);
        });
    }

    function getEwalletDescription(balance) {
      var description = '';
      var balanceRounded = commonService.roundCurrency(balance, { up: false });
      var balanceStr = $filter('currency')(balanceRounded);
      description = 'Saldo disponible: ' + balanceStr + ' MXN';
      return description;
    }

    function initScan() {
      console.log('Query selector: ', document.getElementById('interactive'));
      Quagga.CameraAccess.enumerateVideoDevices().then(function(devices) {
        console.log('DEVICES: ', devices);
        devices.forEach(function(device) {
          $('#devices').append('<li>' + device.label + '</li>');
        });
      });
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: document.querySelector('#interactive'), // Or '#yourElement' (optional)
          },
          decoder: {
            readers: ['upc_reader'],
          },
        },
        function(err) {
          if (err) {
            console.log(err);
            return;
          }
          console.log('Initialization finished. Ready to start');
          Quagga.start();
        }
      );
    }
  }
})();
