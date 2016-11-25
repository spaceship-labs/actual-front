'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('HomeCtrl', HomeCtrl);

function HomeCtrl(
  $location, 
  $rootScope,
  api, 
  dialogService
){
  var vm = this;
  angular.extend(vm,{
    areProductsLoaded: false,
    api: api,
  });

  function init(){
    setCategoryStockProperty();
    if($location.search().startQuotation){
      dialogService.showDialog('Cotizacion creada, agrega productos a tu cotización')
    }
    $rootScope.$on('mainDataLoaded', setCategoryStockProperty);
  }

  function setCategoryStockProperty(event, mainData){
    var activeStore = mainData ?  mainData.activeStore : false;
    vm.stockProperty = 'productsNum';
    if(activeStore && activeStore.code !== 'proyectos'){
      vm.stockProperty = activeStore.code;
    }
  }

  init();
}

HomeCtrl.$inject = [
  '$location',
  '$rootScope',
  'api',
  'dialogService'
];
