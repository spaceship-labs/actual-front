'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('SearchCtrl', SearchCtrl);

function SearchCtrl($location,$routeParams ,productService){
  var vm = this;
  vm.init = init;
  vm.loadMore = loadMore;
  vm.searchByFilters = searchByFilters;

  vm.totalResults = 0;
  vm.isLoading = false;
  vm.loadMoreCount = 1;
  vm.filters = [];

  vm.search = {
    term: $location.search().term,
    items: 10
  };

  vm.init();

  function init(){
    vm.isLoading = true;
    productService.search(vm.search).then(function(res){
      console.log(res);
      vm.totalResults = res.data.total;
      vm.products = productService.formatProducts(res.data.data);
      vm.isLoading = false;
    });

    productService.getAllFilters().then(function(res){
      console.log(res);
      vm.filters = res.data;
    });

  }

  function searchByFilters(){
    vm.isLoading = true;
    //var values = ['5743763aef7d5e62e508e2f0'];
    var values = [];
    vm.filters.forEach(function(filter){
      /*if(filter.selectedValue){
        values.push(filter.selectedValue);
      }*/
      filter.Values.forEach(function(val){
        if(val.selected){
          values.push(val.id);
        }
      });
    });

    productService.getProductsByFilters({ids: values}).then(function(res){
      console.log(res);
      vm.isLoading = false;
      vm.products = productService.formatProducts(res.data);
      vm.totalResults = vm.products.length;
    });
  }


  function loadMore(){
    vm.loadMoreCount++;
    vm.search.page = vm.loadMoreCount;
    vm.isLoading = true;
    productService.search(vm.search).then(function(res){
      console.log(res);
      vm.totalResults = res.data.total;
      var productsAux = angular.copy(vm.products);
      var newProducts = productService.formatProducts(res.data.data);
      vm.products = productsAux.concat(newProducts);
      vm.isLoading = false;
    });
  }

}
