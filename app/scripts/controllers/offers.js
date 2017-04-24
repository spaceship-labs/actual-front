'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:OffersCtrl
 * @description
 * # OffersCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('OffersCtrl', OffersCtrl);

function OffersCtrl(
  $scope,
  $q,
  $filter,
  $rootScope,
  packageService,
  quotationService,
  api,
  localStorageService,
  productService,
  deliveryService,
  dialogService
){
  var vm = this;
  angular.extend(vm,{
    init:init,
    addPackageToCart: addPackageToCart,
    warehouses: [],
    activeStoreWarehouse: false
  });

  var mainDataListener = function(){};

  if($rootScope.activeStore){
    init();
  }else{
    mainDataListener = $rootScope.$on('activeStoreAssigned', function(e){
      init();
    });
  }    

  function init(){
    vm.isLoading = true;
    var activeStoreId = localStorageService.get('activeStore');
    packageService.getPackagesByStore(activeStoreId)
      .then(function(res){
        vm.packages = res.data || [];
        vm.packages = vm.packages.map(function(p){
          p.image = api.baseUrl + '/uploads/groups/' + p.icon_filename;
          return p;
        });
        return loadWarehouses($rootScope.activeStore);
      })
      .then(function(){
        vm.isLoading = false;
      })
      .catch(function(err){
        console.log(err);
      });
  }

  function loadWarehouses(activeStore){
    return api.$http.get('/company/find')
      .then(function(res) {
        vm.warehouses = res.data;
        vm.activeStoreWarehouse = _.findWhere(vm.warehouses,{
          id: activeStore.Warehouse
        });
      });
  }


  function addPackageToCart(packageId){
    vm.isLoading = true;
    var products = [];
    packageService.getProductsByPackage(packageId)
      .then(function(res){
        products     = res.data;
        products     = mapPackageProducts(products);
        var promises = getProductsDeliveriesPromises(products); 
        return $q.all(promises);
      })
      .then(function(deliveries){
        var packageProducts = mapProductsDeliveryDates(products, deliveries, packageId);
        console.log('packageProducts', packageProducts);
        //return;
        if(packageProducts.length > 0){
          quotationService.addMultipleProducts(packageProducts);
        }
      })
      .catch(function(err){
        console.log(err);
      })
  }

  function getProductsDeliveriesPromises(products){
    var promises    = [];
    var activeStoreId = localStorageService.get('activeStore');
    for(var i = 0; i<products.length;i++){
      promises.push(productService.delivery(products[i].ItemCode, activeStoreId));
    }
    return promises;
  }

  function mapPackageProducts(products){
    var packageProducts = products.map(function(product){
      var packageProduct = {
        ItemCode: product.ItemCode,
        id      : product.id,
        quantity: product.packageRule.quantity,
        name    : product.Name || product.ItemName
      };
      return packageProduct;
    });
    return packageProducts;
  }

  function mapProductsDeliveryDates(products, deliveryDates, packageId){
    products = products.map(function(product, index){
      var productDeliveryDates = deliveryDates[index] || [];
      console.log('product: ' + product.ItemCode);
      console.log('deliveryDates', productDeliveryDates);
      product = assignCloserDeliveryDate(
        product, 
        productDeliveryDates, 
        packageId
      );
      return product;
    });
    var unavailableProducts = groupUnavailableProducts(products);
    if(unavailableProducts.length > 0){
      showUnavailableStockMsg(unavailableProducts);
      return [];
    }
    return products;
  }

  function groupUnavailableProducts(products){
    var unavailable = products.filter(function(p){
      return !p.hasStock;
    });
    return unavailable;
  }

  function assignCloserDeliveryDate(product, productDeliveryDates, packageId){
    product.hasStock = true;
    productDeliveryDates = $filter('orderBy')(productDeliveryDates, 'date');

    productDeliveryDates = deliveryService.sortDeliveriesByHierarchy(
      productDeliveryDates,
      vm.warehouses,
      vm.activeStoreWarehouse
    );

    console.log('sortDeliveriesByHierarchy', productDeliveryDates);

    for(var i = (productDeliveryDates.length-1); i>=0; i--){
      var deliveryDate = productDeliveryDates[i];
      if( product.quantity <=  parseInt(deliveryDate.available) ){
        product.shipDate         = deliveryDate.date;
        product.originalShipDate = _.clone(deliveryDate.date);
        product.productDate      = deliveryDate.productDate,
        product.shipCompany      = deliveryDate.company;
        product.shipCompanyFrom  = deliveryDate.companyFrom;
        product.promotionPackage = packageId;
      }
    }
    if(!product.shipDate){
      product.hasStock = false;
    }
    return product;    
  }

  function showUnavailableStockMsg(products){
    var htmlProducts = products.reduce(function(acum, p){
      //console.log('p', p);
      //acum+="<li>"+p.name+'</li>';
      acum += p.name + '('+ p.ItemCode +'), ';
      return acum;
    }, '');
    //htmlProducts += '</ul>';
    dialogService.showDialog(
      'No hay stock disponible de los siguientes productos: '
      + htmlProducts
    );
  }

  $scope.$on('$destroy', function(){
    //unsuscribing listeners
    mainDataListener();
  });

  vm.init();
}

OffersCtrl.$inject = [
  '$scope',
  '$q',
  '$filter',
  '$rootScope',
  'packageService',
  'quotationService',
  'api',
  'localStorageService',
  'productService',
  'deliveryService',
  'dialogService'
];
