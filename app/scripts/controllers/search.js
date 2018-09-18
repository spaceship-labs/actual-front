'use strict';
angular.module('actualApp')
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
  productSearchService,
  activeStore
){
  var vm = this;

  angular.extend(vm, {
    SEARCH_ITEMS: productSearchService.SEARCH_ITEMS,
    OFFSET_TIME_RENDERING: 1000,
    totalResults:0,
    isLoading: true,
    filters: [],
    searchValues: [],
    customBrands: [],
    syncProcessActive: false,
    enableSortOptions: true, 
    activeStore: activeStore,  
    discountFilters: productSearchService.DISCOUNTS_SEARCH_OPTIONS,
    stockFilters: productSearchService.STOCK_SEARCH_OPTIONS,
    societyFilters: productSearchService.SOCIETY_OPTIONS,
    sortOptions: productSearchService.SORT_OPTIONS,
    getFilterById: getFilterById,
    searchByFilters: searchByFilters,
    toggleColorFilter: toggleColorFilter,
    scrollTo: scrollTo,
    toggleSearchSidenav: toggleSearchSidenav,
    removeSearchValue:removeSearchValue,
    removeBrandSearchValue: removeBrandSearchValue,
    removeSelectedDiscountFilter: removeSelectedDiscountFilter,
    removeSelectedStockFilter: removeSelectedStockFilter,
    removeSelectedSocietyFilter: removeSelectedSocietyFilter,
    removeMinPrice: removeMinPrice,
    removeMaxPrice: removeMaxPrice,
    setActiveSortOption: setActiveSortOption,
    isDisabledScrolling: isDisabledScrolling,
    onPageChanged: onPageChanged
  });

  init();

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
      var urlPage = (!isNaN($routeParams.page)) ? parseInt($routeParams.page) : 1;
      var urlMinPrice = (!isNaN($routeParams.minPrice)) ? parseFloat($routeParams.minPrice) : false;
      var urlMaxPrice = (!isNaN($routeParams.maxPrice)) ? parseFloat($routeParams.maxPrice) : false;

      if(urlMinPrice) vm.minPrice = urlMinPrice;
      if(urlMaxPrice) vm.maxPrice = urlMaxPrice;

      var activeSortOptionKey = 'slowMovement';
      var urlSortKey = $routeParams.sortKey || activeSortOptionKey;
      var urlSortDirection = $routeParams.sortDirection;
      vm.activeSortOption = _.findWhere(vm.sortOptions,{key: urlSortKey});
  
      //Overriding default sort option direction with url
      if(vm.activeSortOption && urlSortDirection && (urlSortDirection === 'ASC' || urlSortDirection === 'DESC') ){
        vm.activeSortOption.direction = urlSortDirection;
      }  

      vm.search = {
        keywords: keywords,
        items: vm.SEARCH_ITEMS,
        page: urlPage,
        sortOption: vm.activeSortOption
      };        
      vm.isLoading = true;
      searchByFilters();
    }

    loadFilters();
    loadCustomBrands();

  }

  $scope.$watch('vm.search.page', function(newVal, oldVal){
    if(newVal !== oldVal) {
      productSearchService.persistParamsOnUrl({page: newVal});
    }
  });

  function onPageChanged(newPageNumber){
    vm.search.page = newPageNumber;
    searchByFilters();
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
      })
      .catch(function(err){
        console.log(err);
        var error = err.data || err;
        error = error ? error.toString() : '';
        dialogService.showDialog('Hubo un error: ' + error );           
        vm.isLoading = false;
      });    
  }

  function loadFilters(){
    productService.getAllFilters()
      .then(function(res){
        vm.filters = res.data;
        vm.filters = vm.filters.filter(function(filter){
          return filter.Handle !== 'marcas';
        });
        vm.filters = vm.filters.map(function(filter){
          filter.orderBy = filter.customOrder ? 'createdAt' : 'Name';
          return filter;
        });

        vm.filters = sortFiltersByList(vm.filters);
        onCloseSidenav();
      })
      .catch(function(err){
        console.log('err', err);
      });    
  }

  function onCloseSidenav(){
    $mdSidenav('searchFilters').onClose(function () {
      for(var i = 0; i < vm.filters.length; i++){
        vm.filters[i].active = false;
      }
      vm.isBrandFilterActive = false;
      vm.isDiscountFilterActive = false;
      vm.isStockFilterActive = false;
    });
  }  

  function sortFiltersByList(filters){
    var sortList = ['estilo','material','color','forma'];
    var sorted =  filters.sort(function(a,b){
      return sortList.indexOf(b.Handle) - sortList.indexOf(a.Handle);
    });
    return sorted;
  }

  function loadCustomBrands(){
    productService.getCustomBrands()
      .then(function(res){
        vm.customBrands = res.data;
      })
      .catch(function(err){
        console.log('err', err);
      });    
  }

  function toggleSearchSidenav(filterHandleToOpen){
    $mdSidenav('searchFilters').toggle();
    
    if(filterHandleToOpen){
      var filterIndexToOpen = _.findIndex(vm.filters, function(filter){
        return filter.Handle === filterHandleToOpen;
      });
      if(filterIndexToOpen >= 0){
        vm.filters[filterIndexToOpen].active = true;
      }
      else{

        switch(filterHandleToOpen){
          case 'brand':
            vm.isBrandFilterActive = true;
            break;
          case 'discount':
            vm.isDiscountFilterActive = true;
            break;
          case 'stock':
            vm.isStockFilterActive = true;
            break;
        }
      }
    }
  }

  function removeSearchValue(value){
    var removeIndex = vm.searchValues.indexOf(value);
    if(removeIndex > -1){
      vm.searchValues.splice(removeIndex, 1);
    }
    vm.filters.forEach(function(filter){
      filter.Values.forEach(function(val){
        if(val.id === value.id){
          val.selected = false;
        }
      });
    });
    searchByFilters({resetPagination: true});
  }

  function removeBrandSearchValue(value){
    var removeIndex = vm.brandSearchValues.indexOf(value);
    if(removeIndex > -1){
      vm.brandSearchValues.splice(removeIndex, 1);
    }
    vm.customBrands.forEach(function(brand){
      if(brand.id === value.id){
        brand.selected = false;
      }
    });

    searchByFilters({resetPagination: true});
  }

  function removeSelectedDiscountFilter(discount){
    var removeIndex = vm.discountFiltersSelected.indexOf(discount);
    if(removeIndex > -1){
      vm.discountFiltersSelected.splice(removeIndex, 1);
    }
    vm.discountFilters.forEach(function(discountFilter){
      if(discountFilter.value === discount.value){
        discountFilter.selected = false;
      }
    });

    searchByFilters({resetPagination: true});

  }

  function removeSelectedSocietyFilter(society){
    var removeIndex = vm.societyFiltersSelected.indexOf(society);
    if(removeIndex > -1){
      vm.societyFiltersSelected.splice(removeIndex, 1);
    }
    vm.societyFilters.forEach(function(societyFilter){
      if(societyFilter.code === society.code){
        societyFilter.selected = false;
      }
    });

    searchByFilters({resetPagination: true});

  }  

  function removeSelectedStockFilter(stockRangeObject){
    var removeIndex = vm.stockFiltersSelected.indexOf(stockRangeObject);
    if(removeIndex > -1){
      vm.stockFiltersSelected.splice(removeIndex, 1);
    }
    vm.stockFilters.forEach(function(stockFilters){
      if(stockFilters.id === stockRangeObject.id){
        stockFilters.selected = false;
      }
    });
    searchByFilters({resetPagination: true});
  }  

  function removeMinPrice(){
    delete vm.minPrice;
    searchByFilters({resetPagination: true});
  }

  function removeMaxPrice(){
    delete vm.maxPrice;
    searchByFilters({resetPagination: true});
  }


  function searchByFilters(options){
    options = options || {};
    if(options.resetPagination){
      vm.search.page = 1;
    }

    vm.isLoading = true;
    
    //SEARCH VALUES
    vm.searchValues = productSearchService.getSearchValuesByFilters(vm.filters);
    var searchValuesIds = productSearchService.getSearchValuesIds(vm.searchValues);

    //BRANDS
    vm.brandSearchValues = vm.customBrands.filter(function(brand){
      return brand.selected;
    });
    var brandSearchValuesIds = vm.brandSearchValues.map(function(brand){
      return brand.id;
    });

    //DISCOUNTS
    vm.discountFiltersSelected = vm.discountFilters.filter(function(discount){
      return discount.selected;
    });
    var discountFiltersValues = vm.discountFiltersSelected.map(function(discount){
      return discount.value;
    });

    //STOCK
    vm.stockFiltersSelected = vm.stockFilters.filter(function(stock){
      return stock.selected;
    });
    var stockFiltersValues = vm.stockFiltersSelected.map(function(stock){
      return stock.value;
    });

    //SOCIETIES
    vm.societyFiltersSelected = vm.societyFilters.filter(function(society){
      return society.selected;
    });
    var societyFiltersValues = vm.societyFiltersSelected.map(function(society){
      return society.code;
    });

    var params = {
      ids: searchValuesIds,
      brandsIds: brandSearchValuesIds,
      discounts: discountFiltersValues,
      societyCodes: societyFiltersValues,
      stockRanges: stockFiltersValues,
      keywords: vm.search.keywords,
      minPrice: vm.minPrice,
      maxPrice: vm.maxPrice,
      page: vm.search.page,
      sortOption: vm.activeSortOption
    };

    productSearchService.persistParamsOnUrl({
      sortKey: vm.activeSortOption.key,
      sortDirection: vm.activeSortOption.direction,
      minPrice: vm.minPrice,
      maxPrice: vm.maxPrice
    });

    productService.searchByFilters(params).then(function(res){
      vm.totalResults = res.data.total;
      vm.totalPages = Math.ceil(res.data.total / vm.SEARCH_ITEMS)
      return productService.formatProducts(res.data.products);
    })
    .then(function(fProducts){
      vm.products = fProducts;
      vm.scrollTo('search-page');
      vm.isLoading = false;
    });
  }

  function setActiveSortOption(sortOption){
    if(vm.activeSortOption.key  === sortOption.key){
      //Toggling if the pick the same sort option key
      sortOption.direction = sortOption.direction === 'ASC' ? 'DESC' : 'ASC';
    }
    else if(sortOption.key === 'salesCount' || sortOption.key === 'slowMovement'){
      sortOption.direction = 'DESC';
    }
    else{
      sortOption.direction = 'ASC';
    }

    vm.activeSortOption = sortOption;
    
    searchByFilters({resetPagination: true});
  }

  function getFilterById(filterId){
    return _.findWhere(vm.filters, {id: filterId});
  }

  function toggleColorFilter(value, filter){
    value.selected = !value.selected;
    vm.searchByFilters({resetPagination: true});
  }

  function isDisabledScrolling(){
    return vm.isLoading || vm.isScrollingToItem;
  }

  function scrollTo(target, extraOffset){
    extraOffset = extraOffset || 100;
    $timeout(
        function(){
          $('html, body').animate({
            scrollTop: $('#' + target).offset().top - extraOffset
          }, 600);
        },
        300
    );
  }
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
  'productSearchService',
  'activeStore'
];
