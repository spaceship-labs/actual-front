'use strict';

/**
 * @ngdoc function
 * @name actualWebApp.controller:ReportsQuotationsCtrl
 * @description
 * # ReportsQuotationsCtrl
 * Controller of the actualWebApp
 */

angular
  .module('actualApp')
  .controller('ReportsPaymentsCtrl', function(
    $scope,
    $rootScope,
    $q,
    quotationService,
    siteService,
    orderService,
    paymentService,
    clientService,
    userService,
    storeService,
    authService,
    commonService
  ) {
    var vm = this;
    angular.extend(vm, {
      closedOptions: [
        {label: 'Abiertas', value: {'!': true}},
        {label:'Cerradas', value: true}
      ],    
      user: angular.copy($rootScope.user),
      queryClients: queryClients,
      triggerExportName: 'triggerExcelExport',
      triggerExcelExport: triggerExcelExport,
      triggerSearchName: 'triggerSearch',
      triggerSearch: triggerSearch,
      searchParams: {
        Store: 'none'
      },
      dateRange: {
        field: 'createdAt'
      },
      isStoreManager: authService.isStoreManager($rootScope.user),
      isAdmin: authService.isAdmin($rootScope.user),

      apiResourcePayments: paymentService.paymentsapconciliation,
      onStartDateSelected: onStartDateSelected,
      onEndDateSelected: onEndDateSelected,
      //onStartCloseDateSelected: onStartCloseDateSelected,
      //onEndCloseDateSelected: onEndCloseDateSelected,
      clientSearch: true,
      defaultSort: [1, 'desc'], //created at
      columnsQuotations: [
        {
          key: 'folio',
          label: 'Pago',
          //actionUrl: '/quotations/edit/',
          domainColumn: 'Store'
        },
        { key: 'createdAt', label: 'Fecha', dateTime: true },
        //{ key: 'estimatedCloseDate', label: 'Fecha de cierre', dateTime: true, defaultValue: 'Sin asignar' },
        //{ key: 'discount', label: 'Descuento', currency: true },
        { key: 'Store', label: 'Tienda', defaultValue: 'Sin asignar'},
        {
          key: 'CardCode',
          label: 'S/N',
          defaultValue: 'S/N no encontrado'
        },
        {
          key: 'CardName',
          label: 'Cliente',
          defaultValue: 'Sin cliente'
        },
        {
          key: 'User',
          label: 'Asesor',
        },
        //{ key: 'Client.E_Mail', label: 'Email', defaultValue: 'Sin cliente' },
        //{ key: 'fromOffers', label: 'Paquetes', defaultValue: 'No' },
        { key: 'CounterRef', label: 'Tipo pago', defaultValue: 'Sin asignar'},
        { key: 'terminal', label: 'Terminal', defaultValue: 'Sin terminal' },
        { key: 'ammount', label: 'Monto app Original' },
        { key: 'ammountMXN', label: 'Monto app MX' },
        { key: 'ammountUSD', label: 'Monto app USD' },
        { key: 'DocTotal', label: 'Monto SAP' },
        { key: 'diff', label: 'Diferencia', defaultValue: 'Sin diferencia' },
        { key: 'exchangeRate', label: 'Tipo de cambio' },
      ]
    });
    vm.exportQuery = 'SELECT '
    vm.exportQuery += 'folio as Folio,';
    vm.exportQuery += 'dateFormat(createdAt) as Creacion,';
    vm.exportQuery += '[Store] as Tienda,';
    vm.exportQuery += 'CardCode as SN,';
    vm.exportQuery += 'CardName as Cliente,';
    vm.exportQuery += 'User as Asesor,';
    vm.exportQuery += 'CounterRef as Tipo,'
    vm.exportQuery += 'terminal as Terminal,'
    vm.exportQuery += 'currencyFormat(ammount) as MontoOriginal,';
    vm.exportQuery += 'currencyFormat(ammountMXN) as MontoMX,';
    vm.exportQuery += 'currencyFormat(ammountUSD) as MontoUSD,';
    vm.exportQuery += 'currencyFormat(DocTotal) as MontoSAP,'
    vm.exportQuery += 'currencyFormat(diff) as Diferencia,'
    vm.exportQuery += 'exchangeRate as Cambio'

    //vm.exportQuery += 'dateFormat(estimatedCloseDate) as Cierre,';
    //vm.exportQuery += 'urlFormat(id) as Cotizacion,';
    //vm.exportQuery += 'currencyFormat(discount) as Descuento,';
    //vm.exportQuery += 'Client->E_Mail as Email';
    vm.exportQuery += ' INTO XLS("Cotizaciones.xls",{headers:true}) FROM ?';
    vm.getSellersFromStore = getSellersFromStore;

    init();

    function init() {
      var orderStatusMapper = orderService.getStatusMap();
      vm.orderStatuses = addEverythingOption(
        convertMapperToArray(orderStatusMapper)
      );
      console.log('vm.orderStatuses', vm.orderStatuses);
      loadPaymentsTypes();
      setupManagerData();

    }

    function addEverythingOption(items) {
      items.unshift({
        label: 'Todos',
        value: 'none'
      });
      return items;
    }

    function triggerExcelExport() {
      console.log("Triggered excelExport");
      $scope.$broadcast(vm.triggerExportName);
    }
    /**** */
    function getManagerStores() {
      var userEmail = vm.user.email;
      return userService.getStores(userEmail);
    }
    function getSellersFromStore(id){
      var selectedStore = _.find(vm.stores,{id:id});
      return selectedStore !== undefined ? selectedStore.sellers : []

    }
    function setupManagerData(){
      vm.isLoading = true;
      getManagerStores()
        .then(function(stores){
          vm.stores = stores;
          var storePromises = stores.map(function(store){
            return populateStoreWithSellers(store);          
          });
          vm.isLoading = false;
          return $q.all(storePromises);

        }).then(function(stores){
          console.log('stores', stores);
          vm.stores = stores;
        })
        .catch(function(err){
          console.log('err', err);
        });      
    }
  
    function populateStoreWithSellers(store){
      var deferred = $q.defer();
      storeService.getSellersByStore(store.id)
        .then(function(res){
          store.sellers = res.data;
          store.sellers = store.sellers.map(function(seller){
            seller.filters = {
              User: seller.id
            };
            return seller;
          });
          return store;
        })
        .then(function(store){
          deferred.resolve(store);
        })
        .catch(function(err){
          console.log(err);
          deferred.reject(err);
        });
  
      return deferred.promise;
    }
    $scope.$on('isExporting', function(evt, data) {
      vm.isExporting = data;
    });

    function triggerSearch() {
      //$rootScope.scrollTo('main');
      $scope.$broadcast(vm.triggerSearchName);
    }

    $scope.$watch('vm.selectedClient', function(newVal, oldVal) {
      if (newVal !== oldVal && newVal) {
        console.log('newVal', newVal);
        vm.searchParams.Client = newVal.id;
      }

      if (!newVal) {
        vm.searchParams.Client = 'none';
      }
    });

    function queryClients(term) {
      if (term !== '' && term) {
        var params = { term: term, autocomplete: true };
        return clientService.getClients(1, params).then(function(res) {
          return res.data.data;
        });
      } else {
        return $q.resolve([]);
      }
    }

    function onStartDateSelected(pikaday) {
      vm.dateRange.start = pikaday._d;
      console.log('picked1', vm.dateRange)
    }

    function onEndDateSelected(pikaday) {
      
      vm.dateRange.end = pikaday._d;
      console.log('picked2', vm.dateRange)
    }
    //function onStartCloseDateSelected(pikaday) {
    //  vm.closeDateRange.start = pikaday._d;
    //}
//
    //function onEndCloseDateSelected(pikaday) {
    //  vm.closeDateRange.end = pikaday._d;
    //}

    function loadPaymentsTypes() {
      vm.paymentTypes = paymentService.types;
      console.log(vm.paymentTypes);
    }

    function convertMapperToArray(mapper) {
      var storesArray = [];
      for (var key in mapper) {
        storesArray.push({
          label: mapper[key],
          value: key
        });
      }
      return storesArray;
    }
  });
