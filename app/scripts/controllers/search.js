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

function SearchCtrl(
  $scope,
  $rootScope,
  $location, 
  $timeout,
  $routeParams, 
  $q ,
  $mdSidenav,
  productService, 
  dialogService,
  productSearchService
){
  var vm = this;

  angular.extend(vm, {
    totalResults:0,
    isLoading: false,
    filters: [],
    searchValues: [],
    syncProcessActive: false,
    loadMore: loadMore,
    searchByFilters: searchByFilters,
    toggleColorFilter: toggleColorFilter,
    scrollTo: scrollTo,
    toggleSearchSidenav: toggleSearchSidenav,
    removeSearchValue:removeSearchValue
  });

  var mainDataListener = function(){};

  if($rootScope.activeStore){
    init();
  }else{
    mainDataListener = $rootScope.$on('activeStoreAssigned', function(ev){
      init();
    });
  }  

  function init(){
    var keywords = [''];
    if($routeParams.itemcode) {
      vm.isLoading = true;
      vm.search = {};
      vm.search.itemcode = $routeParams.itemcode;
      syncProduct(vm.search.itemcode);
    }
    else{
      if($routeParams.term){
        keywords = $routeParams.term.split(' ');
      }
      vm.search = {
        keywords: keywords,
        items: 10,
        page: 1
      };
      vm.isLoading = true;
      doInitialSearch();

    }

    loadFilters();

  }

  function doInitialSearch(){
    productService.searchByFilters(vm.search).then(function(res){
      vm.totalResults = res.data.total;
      vm.isLoading = false;
      return productService.formatProducts(res.data.products);
    })
    .then(function(fProducts){
      vm.products = fProducts;
      mainDataListener();
    })
    .catch(function(err){
      console.log(err);
      var error = err.data || err;
      error = error ? error.toString() : '';
      dialogService.showDialog('Hubo un error: ' + error );           
      mainDataListener();
    });    
  }

  function syncProduct(itemcode){
    productService.syncProductByItemcode(itemcode)
      .then(function(res){
        var foundProduct = res.data;
        if(!foundProduct){
          vm.isLoading = false;
          return $q.reject('Producto no encontrado');
        }
        return productService.formatSingleProduct(foundProduct);
      })
      .then(function(formattedProduct){
        vm.isLoading = false;
        dialogService.showDialog('Producto sincronizado');
        vm.totalResults = 1;
        vm.products = [formattedProduct];
        mainDataListener();
      })
      .catch(function(err){
        console.log(err);
        var error = err.data || err;
        error = error ? error.toString() : '';
        dialogService.showDialog('Hubo un error: ' + error );           
        vm.isLoading = false;
        mainDataListener();
      });    
  }

  function loadFilters(){
    productService.getAllFilters()
      .then(function(res){
        vm.filters = res.data;
      })
      .catch(function(err){
        console.log('err', err)
      });    
  }

  function toggleSearchSidenav(){
    $mdSidenav('searchFilters').toggle();
  }

  function removeSearchValue(removeValue){
    var removeIndex = vm.searchValues.indexOf(removeValue);
    if(removeIndex > -1){
      vm.searchValues.splice(removeIndex, 1);
    }
    vm.filters.forEach(function(filter){
      filter.Values.forEach(function(val){
        if(val.id == removeValue.id){
          val.selected = false;
        }
      });
    });
    vm.searchByFilters();
  }

  function searchByFilters(options){
    if(!options || !angular.isDefined(options.isLoadingMore)){
      vm.search.page = 1;
    }
    vm.isLoading = true;
    var searchValuesIds = productSearchService.getSearchValuesIdsByFilters(vm.filters);

    var params = {
      ids: searchValuesIds,
      keywords: vm.search.keywords,
      minPrice: vm.minPrice,
      maxPrice: vm.maxPrice,
      page: vm.search.page
    };

    productService.searchByFilters(params).then(function(res){
      vm.totalResults = res.data.total;
      return productService.formatProducts(res.data.products);
    })
    .then(function(fProducts){
      if(options && options.isLoadingMore){
        var productsAux = angular.copy(vm.products);
        vm.products = productsAux.concat(fProducts);
      }else{
        vm.products = fProducts;
        vm.scrollTo('search-page');
      }
      vm.isLoading = false;
    });
  }

  function toggleColorFilter(value, filter){
    value.selected = !value.selected;
    vm.searchByFilters();
  }

  function loadMore(){
    vm.search.page++;
    vm.searchByFilters({isLoadingMore: true});
  }

  function scrollTo(target){
    $timeout(
        function(){
          $('html, body').animate({
            scrollTop: $('#' + target).offset().top - 100
          }, 600);
        },
        300
    );
  }

  $scope.$on('$destroy', function(){
    mainDataListener();
  });

}

SearchCtrl.$inject = [
  '$scope',
  '$rootScope',
  '$location',
  '$timeout',
  '$routeParams',
  '$q',
  '$mdSidenav',
  'productService',
  'dialogService',
  'productSearchService'
];
