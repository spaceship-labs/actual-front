'use strict';
angular.module('actualApp')
  .controller('CategoryCtrl', CategoryCtrl);

function CategoryCtrl(
  $scope,
  $location,
  $routeParams, 
  $mdSidenav, 
  $timeout,
  categoriesService, 
  productService,
  productSearchService
){
  var vm     = this;

  angular.extend(vm,{
    SEARCH_ITEMS: productSearchService.SEARCH_ITEMS,
    filters: [],
    customBrands: [],
    subnavIndex: 0,
    showLevel2: false,
    showLevel3: false,
    enableSortOptions: false,
    enableFiltersTrigger: false,
    discountFilters: productSearchService.DISCOUNTS_SEARCH_OPTIONS,
    stockFilters: productSearchService.STOCK_SEARCH_OPTIONS,
    societyFilters: productSearchService.SOCIETY_OPTIONS,
    sortOptions: productSearchService.SORT_OPTIONS,

    setSubnavIndex: setSubnavIndex,
    searchByFilters: searchByFilters,
    toggleSearchSidenav: toggleSearchSidenav,
    scrollTo: scrollTo,
    removeSearchValue: removeSearchValue,
    removeMinPrice: removeMinPrice,
    removeMaxPrice: removeMaxPrice,
    removeBrandSearchValue: removeBrandSearchValue,
    removeSelectedDiscountFilter: removeSelectedDiscountFilter,
    removeSelectedStockFilter: removeSelectedStockFilter,
    removeSelectedSocietyFilter: removeSelectedSocietyFilter,
    toggleColorFilter: toggleColorFilter,
    setActiveSortOption: setActiveSortOption,
    getFilterById: getFilterById,
    onPageChanged: onPageChanged
  });


  function setSubnavIndex(index){
    vm.subnavIndex = index;
  }

  function init(){
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
      items: vm.SEARCH_ITEMS,
      page: urlPage,
      category: $routeParams.category,
      sortOption: vm.activeSortOption
    };

    loadCustomBrands();
    loadCategories();
    searchByFilters({initialSearch:true});
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

  function loadCategories() {
    vm.isLoading = true;
    categoriesService.getCategoryByHandle($routeParams.category).then(function(res){
      vm.category = res.data;

      if(vm.category && vm.category.Childs.length === 0){
      	vm.enableSortOptions = true;
        vm.enableFiltersTrigger = true;
      }

      var hasLevel2Categories = false;
      var filters = vm.category.Filters.map(function(filter){
        return filter.id;
      });
      productService.getAllFilters({ids: filters}).then(function(res){
        vm.filters = res.data;

        vm.filters = vm.filters.map(function(filter){
          filter.orderBy = filter.customOrder ? 'createdAt' : 'Name';
          return filter;
        });

        vm.filters = sortFiltersByList(vm.filters);
        onCloseSidenav();

      });
      hasLevel2Categories = !!vm.category.Childs.find(function(child) {
        return child.CategoryLevel === 2;
      });
      vm.showLevel2 = hasLevel2Categories;
      vm.showLevel3 = !hasLevel2Categories;
      vm.isLoading = false;
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


  function searchByFilters(options){
    options = options || {};
    if(options.resetPagination){
      vm.search.page = 1;
    }

    vm.isLoadingProducts = true;

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
      filtervalues: searchValuesIds,
      brandsIds: brandSearchValuesIds,
      discounts: discountFiltersValues,
      societyCodes: societyFiltersValues,

      stockRanges: stockFiltersValues,
      sortOption: vm.activeSortOption,

      minPrice: vm.minPrice,
      maxPrice: vm.maxPrice,
      category: $routeParams.category,
      page: vm.search.page,
    };

    productSearchService.persistParamsOnUrl({
      sortKey: vm.activeSortOption.key,
      sortDirection: vm.activeSortOption.direction,
      minPrice: vm.minPrice,
      maxPrice: vm.maxPrice
    });
    
    productService.searchCategoryByFilters(params)
      .then(function(res){
        var products = res.data.products || [];
        vm.totalProducts = res.data.total;
        vm.totalPages = Math.ceil(res.data.total / vm.search.items);        
        return productService.formatProducts(products);
      })
      .then(function(productsFormatted){
        vm.products = productsFormatted;
        if(!options.initialSearch){
          vm.scrollTo('products-results');
        }
        vm.isLoadingProducts = false;
      })
      .catch(function(err){
        console.log('err', err);
      });
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


  function removeMinPrice(){
    delete vm.minPrice;
    searchByFilters({resetPagination: true});
  }

  function removeMaxPrice(){
    delete vm.maxPrice;
    searchByFilters({resetPagination: true});
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

  function toggleColorFilter(value, filter){
    value.selected = !value.selected;
    vm.searchByFilters({resetPagination: true});
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

  function setActiveSortOption(sortOption){
    if(vm.activeSortOption.key  === sortOption.key){
      sortOption.direction = sortOption.direction === 'ASC' ? 'DESC' : 'ASC';
    }
    else if(sortOption.key === 'salesCount' || sortOption.key === 'slowMovement'){
      sortOption.direction = 'DESC';
    }
    else{
      sortOption.direction = 'ASC';
    }

    vm.activeSortOption = sortOption;
    searchByFilters();
  }

  function getFilterById(filterId){
    return _.findWhere(vm.filters, {id: filterId});
  }

  init();
}

CategoryCtrl.$inject = [
  '$scope',
  '$location',
  '$routeParams',
  '$mdSidenav',
  '$timeout',
  'categoriesService',
  'productService',
  'productSearchService'
];
