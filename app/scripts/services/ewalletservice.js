(function() {
  'use strict';

  angular.module('actualApp').factory('ewalletService', ewalletService);

  /** @ngInject */
  function ewalletService($filter, clientService, commonService, api, Upload) {
    var EWALLET_TYPE = 'ewallet';
    var EWALLET_GROUP_INDEX = 0;

    var service = {
      ewalletType: EWALLET_TYPE,
      ewalletGroupIndex: EWALLET_GROUP_INDEX,
      updateQuotationEwalletBalance: updateQuotationEwalletBalance,
      getEwallet: getEwallet,
      getEwalletSingle: getEwalletSingle,
      getEwalletExchangeRate: getEwalletExchangeRate,
      addFile: addFile,
      initScan: initScan,
    };

    return service;

    //@param quotation - Object quotation populated with Payments and Client

    function getEwallet(cardNumber, client, type) {
      var url = '/ewallet/' + client + '/' + cardNumber;
      return api.$http.get(url, { type: type }).then(function(response) {
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

    function addFile(clientId, params) {
      var url = '/replacementupdate/' + clientId;
      return Upload.upload({ url: api.baseUrl + url, data: params });
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
      var App = {
        init: function() {
          var self = this;
          var cam = null;
          Quagga.CameraAccess.enumerateVideoDevices().then(function(devices) {
            cam = devices.reduce(function(camera, device) {
              console.log('CAMERA: ', camera);
              console.log('DEVICE: ', device);
              return device.label.indexOf('back') < 0
                ? camera.deviceId
                : device.deviceId;
            }, devices[0]);
            console.log('CAM: ', cam);
            Quagga.init(App.state(cam), function(err) {
              if (err) {
                return self.handleError(err);
              }
              //Quagga.registerResultCollector(resultCollector);
              App.initCameraSelection();

              Quagga.start();
            });
          });
        },
        handleError: function(err) {
          console.log(err);
        },

        initCameraSelection: function() {
          var streamLabel = Quagga.CameraAccess.getActiveStreamLabel();
          return Quagga.CameraAccess.enumerateVideoDevices().then(function(
            devices
          ) {
            devices.forEach(function(device) {
              var $option = document.createElement('option');
              $option.value = device.deviceId || device.id;
              $option.selected = streamLabel === device.label;
            });
          });
        },
        state: function(camera) {
          var state = {
            inputStream: {
              type: 'LiveStream',
              constraints: {
                width: { min: 640 },
                height: { min: 480 },
                facingMode: 'environment',
                aspectRatio: { min: 1, max: 2 },
                deviceId: camera,
              },
            },
            locator: {
              patchSize: 'medium',
              halfSample: true,
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
              readers: [
                {
                  format: 'upc_reader',
                  config: {},
                },
              ],
            },
            locate: true,
          };
          return state;
        },
        lastResult: null,
      };

      App.init();
    }
  }
})();
