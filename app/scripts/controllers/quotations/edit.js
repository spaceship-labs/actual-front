'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:QuotationsEditCtrl
 * @description
 * # QuotationsEditCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('QuotationsEditCtrl', QuotationsEditCtrl);

function QuotationsEditCtrl(
  $log,
  $location,
  $routeParams,
  $q,
  $scope,
  localStorageService,
  $rootScope,
  $mdMedia,
  $mdDialog,
  $filter,
  quotationService,
  api,
  dialogService,
  userService,
  packageService,
  paymentService,
  deliveryService,
  siteService,
  pmPeriodService,
  DTOptionsBuilder, 
  DTColumnDefBuilder
){
  var vm = this;
  angular.extend(vm, {
    newRecord: {},
    api: api,
    brokers: [],
    isLoadingRecords: false,
    isLoading: true,
    recordTypes: quotationService.getRecordTypes(),
    closeTypes: quotationService.getClosingReasons(),
    timePickerOptions: {
        step: 20,
        timeFormat: 'g:ia',
        appendTo: 'body',
        disableTextInput:true
    },
    promotionPackages: [],
    addNewProduct: addNewProduct,
    applyForBigticket: applyForBigticket,
    appliesForPackageOrPromotionDiscount: appliesForPackageOrPromotionDiscount,
    addRecord: addRecord,
    alertRemoveDetail: alertRemoveDetail,
    attachImage: attachImage,
    closeQuotation: closeQuotation,
    continueBuying: continueBuying,
    getPromotionPackageById: getPromotionPackageById,
    getUnitPriceWithDiscount: getUnitPriceWithDiscount,
    getWarehouseById: getWarehouseById,
    isValidStock: isValidStock,
    removeDetail: removeDetail,
    removeDetailsGroup: removeDetailsGroup,
    toggleRecord: toggleRecord,
    sendByEmail: sendByEmail,
    showDetailGroupStockAlert: showDetailGroupStockAlert,
    showBigTicketDialog: showBigTicketDialog,
    print: print,
    daysDiff: daysDiff,
    isUserAdmin: isUserAdmin
  });

  if($rootScope.isMainDataLoaded){
    vm.activeStore = $rootScope.activeStore;
    init();
  }else{
    var mainDataListener = $rootScope.$on('mainDataLoaded', function(e, mainData){
      init();
    });
  }

  function init(){
    vm.isLoading = true;
    loadWarehouses();
    showAlerts();

    quotationService.getById($routeParams.id)
      .then(function(res){
        vm.isLoading = false;
        vm.quotation = res.data;
        quotationService.setActiveQuotation(vm.quotationId);

        vm.status = 'Abierta';
        if(vm.quotation.Order || vm.quotation.isClosed){
          vm.status = 'Cerrada';
        }

        loadPaymentMethods();
        return quotationService.populateDetailsWithProducts(vm.quotation);
      })
      .then(function(details){
        vm.quotation.Details = details;
        return quotationService.loadProductFilters(vm.quotation.Details);
      })
      .then(function(detailsWithFilters){
        vm.quotation.Details = detailsWithFilters;
        vm.isLoadingRecords = true;
        return quotationService.getCurrentStock(vm.quotation.id);       
      })
      .then(function(response){
        var detailsStock = response.data;
        vm.quotation.Details = quotationService.mapDetailsStock(vm.quotation.Details, detailsStock);
        vm.quotation.DetailsGroups = deliveryService.groupDetails(vm.quotation.Details);
        return quotationService.getRecords(vm.quotation.id);
      })
      .then(function(result){
        var promisesArray = [];
        vm.quotation.Records = result.data;
        vm.isLoadingRecords = false;
        var packagesIds = vm.quotation.Details.reduce(function(acum, d){
          if(d.PromotionPackageApplied){
            acum.push(d.PromotionPackageApplied);
          }
          return acum;
        },[]);
        packagesIds = _.uniq(packagesIds);
        packagesIds.forEach(function(pId){
          promisesArray.push(packageService.getDetailedPackage(pId));
        });
        if(promisesArray.length > 0){
          return $q.all(promisesArray);
        }
        return [];
      })
      .then(function(results){
        //Mapping HTTP response
        vm.promotionPackages = results.map(function(r){
          return r.data;
        });
      })
      .catch(function(err){
        $log.error(err);
      });

    userService.getBrokers().then(function(brokers){
      vm.brokers = brokers;
    });

    pmPeriodService.getActive().then(function(res){
      vm.validMethods = res.data;
    });

  }

  function showAlerts(){
    if($location.search().startQuotation){
      //dialogService.showDialog('Cotizacion creada, agrega productos a tu cotización');
    }    
    if($location.search().createdClient){
      dialogService.showDialog('Cliente registrado');
    }
    if($location.search().stockAlert){
      quotationService.showStockAlert();
    }
  }

  function loadWarehouses(){
    api.$http.get('/company/find').then(function(res){
      vm.warehouses = res.data;
    })
    .catch(function(err){
      $log.error(err);
    });
  }

  function loadPaymentMethods(){
    quotationService.getPaymentOptions(vm.quotation.id)
      .then(function(response){
        var groups = response.data || [];
        vm.paymentMethodsGroups = groups;
        console.log('vm.paymentMethodsGroups', vm.paymentMethodsGroups);
      })
      .catch(function(err){
        console.log('err', err);
      });
  }
 
  function print(){
    window.print();
  }

  function sendByEmail(){
    vm.isLoading = true;
    quotationService.sendByEmail(vm.quotation.id)
    .then(function(res){
      vm.isLoading = false;
      dialogService.showDialog('Email enviado al cliente');
    })
    .catch(function(err){
      $log.error(err);
      vm.isLoading = false;
      dialogService.showDialog('Hubo un error, intentalo de nuevo');
    });
  }


  function getWarehouseById(id){
    var warehouse = {};
    if(vm.warehouses){
      warehouse = _.findWhere(vm.warehouses, {id: id});
    }
    return warehouse;
  }

  function toggleRecord(record){
    vm.quotation.Records.forEach(function(rec){
      if(rec.id != record.id){
        rec.isActive = false;
      }
    });
    record.isActive = !record.isActive;
  }

  function appliesForPackageOrPromotionDiscount(detail){
    var appliesFor = false;
    if(detail.PromotionPackageApplied){
      appliesFor = 'packageDiscount';
    }else if(detail.Product.mainPromo){
      appliesFor = 'promoDiscount';
    }
    return appliesFor;
  }

  function addRecord(form){
    if(vm.newRecord.eventType && form.$valid){
      vm.isLoadingRecords = true;

      //Formatting date and time
      var date = moment(vm.newRecord.date._d);
      var time = vm.newRecord.time;
      var year = date.get('year');
      var month = date.get('month');
      var day = date.get('date');
      var dateTime = moment(time).set('year',year).set('month',month).set('date',day)._d;

      vm.newRecord.dateTime = dateTime;
      var params = {
        dateTime: vm.newRecord.dateTime,
        eventType: vm.newRecord.eventType,
        notes: vm.newRecord.notes,
        User: $rootScope.user.id,
        file: vm.newRecord.file
      };

      quotationService.addRecord(vm.quotation.id, params)
        .then(function(res){
          if(res.data.id){
            vm.quotation.Records.push(res.data);
          }
          vm.newRecord = {};
          vm.isLoadingRecords = false;
        })
        .catch(function(err){
          $log.error(err);
          vm.isLoadingRecords = false;
        });
    }
  }


  function getLastTracingDate(quotation){
    var tracingDate = new Date();
    if(quotation.Records && quotation.Records.length > 1){
      var lastIndex = quotation.Records.length - 2;
      tracingDate = quotation.Records[lastIndex].dateTime;
    }
    return tracingDate;
  }

  function isUserAdmin(){
    if($rootScope.user.role && $rootScope.user.role.name === 'admin'){
      return true;
    }
    return false;
  }

  function closeQuotation(form,closeReason, extraNotes){
    if(closeReason){
      vm.isLoading = true;
      var params = {
        notes: extraNotes,
        User: $rootScope.user.id,
        tracing: getLastTracingDate(vm.quotation),
        notes: extraNotes,
        closeReason: closeReason,
        extraNotes: extraNotes
      };
      quotationService.closeQuotation(vm.quotation.id, params)
        .then(function(res){
          var record = res.data.record;
          var quotation = res.data.quotation;
          if(record){
            vm.quotation.Records.push(record);
          }
          if(quotation){
            vm.quotation.isClosed = quotation.isClosed;
            if(vm.quotation.isClosed){
              vm.status = 'Cerrada';
            }
          }
          vm.isLoading = false;
          vm.quotation.Records.forEach(function(rec){
            rec.isActive = false;
          }); 
        })         
        .catch(function(err){
          $log.error(err);
        });
    }
  }

  function getPromotionPackageById(packageId){
    return _.findWhere(vm.promotionPackages, {id:packageId}); 
  }

  function attachImage(file){
    vm.newRecord.file = file;
  }

  function addNewProduct(){
    quotationService.setActiveQuotation(vm.quotation.id);
    $rootScope.$emit('newActiveQuotation', vm.quotation.id);
    $location.path('/');
  }

  function alertRemoveDetail(ev, detailsGroup) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog
      .confirm()
      .title('¿Eliminar articulo de la cotizacion?')
      .textContent('-' + detailsGroup.Product.Name)
      .ariaLabel('')
      .targetEvent(ev)
      .ok('Eliminar')
      .cancel('Cancelar');
    
    $mdDialog.show(confirm).then(function() {
      removeDetailsGroup(detailsGroup);
    }, function() {
      console.log('Eliminado');
    });
  }

  function removeDetailsGroup(detailsGroup){
    var deferred = $q.defer();
    vm.isLoadingDetails = true;
    var detailsIds = detailsGroup.details.map(function(d){return d.id;});
    var params = {
      detailsIds: detailsIds
    };
    quotationService.removeDetailsGroup(params, vm.quotation.id)
      .then(function(res){
        var updatedQuotation = res.data;
        vm.isLoadingDetails        = false;
        vm.quotation.total         = updatedQuotation.total;
        vm.quotation.subtotal      = updatedQuotation.subtotal;
        vm.quotation.discount      = updatedQuotation.discount;
        vm.quotation.totalProducts = updatedQuotation.totalProducts;
        if(updatedQuotation.Details){
          vm.quotation.Details =  updateDetailsInfo(
            vm.quotation.Details, 
            updatedQuotation.Details
          );
          vm.quotation.DetailsGroups = deliveryService.groupDetails(vm.quotation.Details);
        }
        return $rootScope.loadActiveQuotation();
      })
      .then(function(){
        deferred.resolve();
      })
      .catch(function(err){
        console.log(err);
        deferred.reject(err);
      });

    return deferred.promise;
  }

  function removeDetail(detailId, index){
    vm.isLoadingDetails = true;
    quotationService.removeDetail(detailId, vm.quotation.id)
      .then(function(res){
        var updatedQuotation = res.data;
        vm.quotation.Details.splice(index,1);
        vm.isLoadingDetails        = false;
        vm.quotation.total         = updatedQuotation.total;
        vm.quotation.subtotal      = updatedQuotation.subtotal;
        vm.quotation.discount      = updatedQuotation.discount;
        vm.quotation.totalProducts = updatedQuotation.totalProducts;
        if(updatedQuotation.Details){
          vm.quotation.Details =  updateDetailsInfo(
            updatedQuotation.Details, 
            updatedQuotation.Details
          );
        }
        $rootScope.loadActiveQuotation();
      })
      .catch(function(err){
        $log.error(err);
      });
  }

  function updateDetailsInfo(details, newDetails){
    var removedDetailsIds = [];
    for(var i=0;i<details.length; i++){
      var detail = details[i];
      var match = _.findWhere(newDetails, { id: detail.id } );
      if(match){
        detail.unitPrice        = match.unitPrice;
        detail.discountPercent  = match.discountPercent;
        detail.discount         = match.discount;
        detail.subtotal         = match.subtotal;
        detail.total            = match.total;
        detail.Promotion        = match.Promotion;
        detail.PromotionPackageApplied = match.PromotionPackageApplied;
      }
    }
    details = details.filter(function(d){
      return _.findWhere(newDetails, {id: d.id});
    });
    return details;
  }

  function isValidStock(details){
    if(!details){
      return false;
    }
    return quotationService.isValidStock(details);    
  }

  function continueBuying(){
    if( !isValidStock(vm.quotation.Details) ){
      showStockAlert();
      return;
    }
    if(!vm.quotation.Order){
      vm.isLoading = true;

      var params = angular.copy(vm.quotation);
      if(params.Details){
        params.Details = params.Details.map(function(detail){
          detail.Product = detail.Product.id;
          return detail;
        });
      }

      quotationService.update(vm.quotation.id, params)
        .then(function(res){
          vm.isLoading = false;
          if(vm.quotation.Client){
            quotationService.setActiveQuotation(vm.quotation.id);
            $location.path('/checkout/client/' + vm.quotation.id);
          }else{
            console.log('No hay cliente');
            quotationService.setActiveQuotation(vm.quotation.id);
            $location.path('/continuequotation').search({goToCheckout:true});
          }
        })
        .catch(function(err){
          $log.error(err);
        });
    }else{
      dialogService.showDialog('Esta cotización ya tiene un pedido asignado');
    }
  }

  function applyForBigticket(){
    var total = vm.quotation.total;
    var applies = false;
    var bigticketTable = [
      {min:100000, max:199999.99, maxPercentage:2},
      {min:200000, max:349999.99, maxPercentage:3},
      {min:350000, max:499999.99, maxPercentage:4},
      {min:500000, max:Infinity, maxPercentage:5},
    ];
    for(var i=0;i<bigticketTable.length;i++){
      if(total >= min && total <= max){
        applies = true;
      }
    }
    return true;
    //return applies;
  }

  function getUnitPriceWithDiscount(unitPrice,discountPercent){
    var result = unitPrice - ( ( unitPrice / 100) * discountPercent );
    return result;
  }

  function daysDiff(a, b) {
    a = (a && new Date(a)) || new Date();
    b = (b && new Date(b)) || new Date();
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;
    var utc1        = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var utc2        = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.abs(Math.floor((utc2 - utc1) / _MS_PER_DAY));
  }

  function showDetailGroupStockAlert(ev,detailGroup){
    var controller = StockDialogController;
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));    
    $mdDialog.show({
      controller: [
        '$scope', 
        '$mdDialog',
        '$location', 
        'detailGroup', 
        controller
      ],
      templateUrl: 'views/quotations/stock-dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: useFullScreen,
      locals:{
        detailGroup: detailGroup
      }
    })
    .then(function(manager) {
    }, function() {
      console.log('No autorizado');
    });    
  }

  function StockDialogController($scope, $mdDialog, $location, detailGroup){
    
    $scope.cancel = function(){
      $mdDialog.cancel();
    };

    $scope.delete = function(){
      $mdDialog.hide();
      quotationService.setActiveQuotation(vm.quotation.id);        
      removeDetailsGroup(detailGroup);
    };
  
    $scope.modify = function(){
      $mdDialog.hide();   
      var itemCode = angular.copy(detailGroup.Product.ItemCode);  
      quotationService.setActiveQuotation(vm.quotation.id);
      removeDetailsGroup(detailGroup).then(function(){
        $location.path('/product/' + itemCode);
      });
    };
  }

  function showBigTicketDialog(ev,detailGroup){
    var controller = BigTicketController;
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));    
    $mdDialog.show({
      controller: [
        '$scope',
        '$mdDialog', 
        controller
      ],
      templateUrl: 'views/quotations/bigticket-dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: useFullScreen,
      locals:{
      }
    })
    .then(function() {
      console.log('Big ticket aplicado');
    }, function() {
      console.log('No autorizado');
    });    
  } 
  
  function BigTicketController($scope, $mdDialog){
    $scope.init = function(){
      $scope.bigticketPercentage = 1;
    };

    $scope.percentages = [
      {label:'1%',value:1},
      {label:'2%',value:2},
      {label:'3%',value:3},
      {label:'4%',value:4},
      {label:'5%',value:5},
    ];
    $scope.cancel = function(){
      $mdDialog.cancel();
    };

    $scope.init();    
  }

  $scope.$on('$destroy', function(){
    mainDataListener();
  });

}

QuotationsEditCtrl.$inject = [
  '$log',
  '$location',
  '$routeParams',
  '$q',
  '$scope',
  'localStorageService',
  '$rootScope',
  '$mdMedia',
  '$mdDialog',
  '$filter',
  'quotationService',
  'api',
  'dialogService',
  'userService',
  'packageService',
  'paymentService',
  'deliveryService',
  'siteService',
  'pmPeriodService',
  'DTOptionsBuilder', 
  'DTColumnDefBuilder'
];