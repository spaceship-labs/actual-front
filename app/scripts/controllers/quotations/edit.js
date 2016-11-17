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
    recordTypes: ['Email', 'Llamada', 'WhatsApp', 'Visita'],
    closeTypes: [
      'Cliente compró en otra tienda de la empresa.',
      'Cliente compró en otra mueblería.',
      'Cliente se murió',
      'Cliente solicita no ser contactado más',
      'Cliente ya no está interesado',
      'Cliente es incontactable',
      'Cliente se mudó',
      'Vendedor no dio seguimiento suficiente',
      'Vendedor cotizó artículos equivocados',
      'Los precios son altos',
      'Las fechas de entrega son tardadas',
      'No vendemos el articulo solicitado',
      'Otra razón (especificar)',
    ],
    timePickerOptions: {
        step: 20,
        timeFormat: 'g:ia',
        appendTo: 'body',
        disableTextInput:true
    },
    promotionPackages: [],
    addNewProduct: addNewProduct,
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
    print: print,
    daysDiff: daysDiff,
    isActiveGroup: isActiveGroup
  });

  var EWALLET_TYPE = 'ewallet';
  var CASH_USD_TYPE = 'cash-usd';
  var EWALLET_GROUP_INDEX = 0;


  $rootScope.$on('activeStoreAssigned', function(){
    vm.activeStore = $rootScope.activeStore;
  });

  function init(){
    vm.isLoading = true;
    loadWarehouses();
    showAlerts();

    quotationService.getById($routeParams.id)
      .then(function(res){
        vm.isLoading = false;
        vm.quotation = res.data;
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
    if($location.search().createdClient){
      dialogService.showDialog('Cliente registrado');
    }
    if($location.search().stockAlert){
      showStockAlert();
    }
  }

  function showStockAlert(){
    var msg = 'Hay un cambio de disponibilidad en uno o más de tus articulos';
    dialogService.showDialog(msg);        
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
    getPaymentMethodsGroups(vm.quotation.id).then(function(groups){
      vm.paymentMethodsGroups = groups;
    });          
  }

  function getPaymentMethodsGroups(quotationId){
    var methodsGroups = paymentService.getPaymentMethodsGroups();
    var discountKeys = ['discountPg1','discountPg2','discountPg3','discountPg4','discountPg5'];
    var totalsPromises = [];
    var exchangeRate = 18.76;
    methodsGroups.forEach(function(mG){
      totalsPromises.push(quotationService.getQuotationTotals(quotationId, {paymentGroup:mG.group}));
    });

    return getExchangeRate()
      .then(function(exr){
        exchangeRate = exr;
        return $q.all(totalsPromises);
      })
      .then(function(responsePromises){
        var totalsByGroup = responsePromises || [];
        totalsByGroup = totalsByGroup.map(function(tbg){
          return tbg.data || {};
        });
        methodsGroups = methodsGroups.map(function(mG, index){
          mG.total = totalsByGroup[index].total || 0;
          mG.subtotal = totalsByGroup[index].subtotal || 0;
          mG.discount = totalsByGroup[index].discount || 0;
          mG.methods = mG.methods.map(function(m){
            var discountKey = discountKeys[mG.group - 1];
            m.discountKey = discountKey;
            m.total = mG.total;
            m.subtotal = mG.subtotal;
            m.discount = mG.discount;
            m.exchangeRate = exchangeRate;
            return m;
          });
          return mG;
        });
        console.log('methodsGroups', methodsGroups);
        return methodsGroups;
      })
      .catch(function(err){
        console.log(err);
        return err;
      });
  }  

  function getExchangeRate(){
    var deferred = $q.defer();
    siteService.findByHandle('actual-group').then(function(res){
      var site = res.data || {};
      deferred.resolve(site.exchangeRate);
    }).catch(function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  }  

  function isActiveGroup(index){
    var activeKeys = ['paymentGroup1','paymentGroup2','paymentGroup3','paymentGroup4','paymentGroup5'];
    if(vm.validMethods){
      return vm.validMethods[activeKeys[index]];
    }else{
      return false;
    }
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

  function closeQuotation(form,closeReason, extraNotes){
    if(closeReason){
      vm.isLoading = true;
      var params = {
        dateTime: new Date(),
        eventType: 'Cierre',
        notes: extraNotes,
        User: $rootScope.user.id
      };
      quotationService.addRecord(vm.quotation.id, params)
        .then(function(res){
          if(res.data.id){
            vm.quotation.Records.push(res.data);
          }
          var updateParams = {
            isClosed: true,
            isClosedReason: closeReason,
            isClosedNotes: extraNotes,
            status: 'closed',
            tracing: getLastTracingDate(vm.quotation)
          };
          return quotationService.update(vm.quotation.id, updateParams);
        })
        .then(function(result){
          if(result.data){
            vm.quotation.isClosed = result.data.isClosed;
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
        return $rootScope.getActiveQuotation();
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
        $rootScope.getActiveQuotation();
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
    
    function setActiveQuotation(){
      quotationService.setActiveQuotation(vm.quotation.id);
      $rootScope.$emit('newActiveQuotation', vm.quotation.id);
    }

    $scope.cancel = function(){
      $mdDialog.cancel();
    };

    $scope.delete = function(){
      $mdDialog.hide();
      setActiveQuotation();        
      removeDetailsGroup(detailGroup);
    };
  
    $scope.modify = function(){
      $mdDialog.hide();   
      var itemCode = angular.copy(detailGroup.Product.ItemCode);  
      setActiveQuotation(); 
      removeDetailsGroup(detailGroup).then(function(){
        $location.path('/product/' + itemCode);
      });
    };
  }

  init();

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