'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CheckoutOrderCtrl
 * @description
 * # CheckoutOrderCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CheckoutOrderCtrl', CheckoutOrderCtrl);

function CheckoutOrderCtrl(
  api,
  commonService ,
  $routeParams,
  $rootScope,
  $location,
  dialogService,
  quotationService,
  orderService,
  deliveryService,
  invoiceService,
  paymentService
){
  var vm = this;
  var EWALLET_POSITIVE = 'positive';
  var EWALLET_NEGATIVE = 'negative';


  angular.extend(vm, {    
    toggleRecord: toggleRecord,
    isLoading: false,
    api: api,
    generateInvoice: generateInvoice,
    getPaymentTypeString: paymentService.getPaymentTypeString,
    getSerieByDetailId: getSerieByDetailId,
    sendInvoice: sendInvoice,
    calculateBalance: orderService.calculateBalance
  });

  function init(){
    //vm.isLoading = false;
    vm.isLoading = true;
    vm.isLoadingRecords = true;
    orderService.getById($routeParams.id).then(function(res){
      vm.order = res.data;
      vm.order.Details = vm.order.Details || [];
      vm.order.Address = orderService.formatAddress(vm.order.Address);
      vm.series = groupSeries(vm.order.OrdersSap);

      vm.ewallet = {
        positive: orderService.getEwalletAmmount(vm.order.EwalletRecords, EWALLET_POSITIVE),
        negative: orderService.getEwalletAmmount(vm.order.EwalletRecords,EWALLET_NEGATIVE),
      };
      vm.ewallet.before = vm.order.Client.ewallet + vm.ewallet.negative - vm.ewallet.positive;
      vm.ewallet.current = vm.order.Client.ewallet;

      vm.isLoading = false;
      quotationService.populateDetailsWithProducts(vm.order)
        .then(function(details){
          vm.order.Details = details;
          vm.order.DetailsGroups = deliveryService.groupDetails(details);
          vm.order.DetailsGroups = assignSeriesToDeliveryGroups(vm.order.DetailsGroups);
          return quotationService.loadProductFilters(vm.order.Details);
        })
        .then(function(details2){
          vm.order.Details = details2;
        })
        .catch(function(err){
          console.log(err);
        });

      quotationService.getRecords(vm.order.Quotation)
        .then(function(result){
          console.log(result);
          vm.records = result.data;
          vm.isLoadingRecords = false;
        })
        .catch(function(err){
          console.log(err);
        });
    })
    .catch(function(err){
      console.log(err);
      vm.isLoading = false;
    });

    invoiceService.find($routeParams.id).then(function(invoices){
      vm.invoiceExists = invoices.length > 0;
    });

  }

  function assignSeriesToDeliveryGroups(deliveryGroups){
    var mappedDeliveryGroups = deliveryGroups.map(function(group){
      var hasSeries = false;
      group.details = group.details.map(function(detail){
        var productSerie = getSerieByDetailId(detail.id);
        if(productSerie){
          detail.productSerie = productSerie;
          hasSeries = true;
        }
        return detail;
      });
      group.hasSeries = hasSeries;
      return group;
    });
    return mappedDeliveryGroups;
  }

  function groupSeries(ordersSap){
    var series = ordersSap.reduce(function(acum,orderSap){
      if(orderSap.ProductSeries){
        acum = acum.concat(orderSap.ProductSeries);
      }
      return acum;
    },[]);

    return series;
  }

  function getSerieByDetailId(detailId){
    var series = vm.series || [];
    return _.findWhere(series, {OrderDetail: detailId});
  }

  function toggleRecord(record){
    vm.records.forEach(function(rec){
      if(rec.id !== record.id){
        rec.isActive = false;
      }
    });
    record.isActive = !record.isActive;
  }


  function print(){
    window.print();
  }

  function generateInvoice() {
    vm.isLoading = true;
    invoiceService
      .create($routeParams.id)
      .then(function(res) {
        vm.isLoading = false;
        vm.invoiceExists = true;
        dialogService.showDialog('Factura creada exitosamente');
        console.log('factura created response', res);
      })
      .catch(function(err) {
        vm.isLoading = false;
        var error = err.data.message;
        dialogService.showDialog(error);
      });
  }

  function sendInvoice() {
    vm.isLoading = true;
    invoiceService
      .send($routeParams.id)
      .then(function(res) {
        vm.isLoading = false;
        dialogService.showDialog('Factura enviada exitosamente');
        console.log('factura sent response', res);
      })
      .catch(function(err) {
        vm.isLoading = false;
        var error = err.data.message;
        dialogService.showDialog(error);
      });
  }

  init();
}
