'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:QuotationsListCtrl
 * @description
 * # QuotationsListCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('QuotationsListCtrl', QuotationsListCtrl);

function QuotationsListCtrl(
    $q,
    $rootScope,
    $filter,
    commonService,
    authService,
    quotationService,
    storeService
  ){

  var vm = this;
  angular.extend(vm,{
    apiResourceQuotations: quotationService.getList,
    applyFilters: applyFilters,
    createdRowCb: createdRowCb,
    isUserAdminOrManager: isUserAdminOrManager,
    isUserSellerOrAdmin:isUserSellerOrAdmin,
    onDateEndSelect: onDateEndSelect,
    onDateStartSelect: onDateStartSelect,
    dateEnd: false,
    defaultSort: [6, 'asc'],
    closedOptions: [
      {label: 'Abiertas', value: {'!': true}},
      {label:'Cerradas', value: true}
    ],    
    columnsLeads: [
      {key: 'folio', label:'Folio'},
      {key:'Client.CardName', label:'Cliente', defaultValue:'Sin cliente'},
      {key:'Client.E_Mail', label:'Email', defaultValue:'Sin cliente'},
      {key:'createdAt', label:'Cotización' ,date:true},
      {key:'total', label: 'Total', currency:true},
      {key:'status', label:'Status', 
        mapper:{
          'to-order':'Cerrada(orden)',
          'closed': 'Cerrada',
        },
        defaultValue: 'Abierta'
      },
      {
        key:'tracing', 
        label:'Seguimiento', 
        defaultValue: '-',
        color: 'red',
        //defaultValue: moment().add(5,'days').toDate(),
        dateTime: true
      },
      {
        key:'source',
        label:'Fuente',
        defaultValue:'-'
      },
      {
        key:'Acceder',
        label:'Acceder',
        propId: 'id',
        actions:[
          {url:'/quotations/edit/',type:'edit'},
        ]
      },
    ],
    endDate: false,
    quotationsData:{},
    listScopes: [],
    filters: {
      User: $rootScope.user.id,
      isClosed: {'!': true}
    },
    startDate: false,
    store:{
      ammounts:{}
    },    
    user: $rootScope.user,
  });

  vm.globalDateRange = {
    field: 'tracing',
    start: vm.startDate,
    end: vm.endDate
  }; 

  vm.listScopes = [
    {label: 'Mis oportunidades', value: vm.user.id},
    {label: 'Todas las oportunidades', value:'none'}
  ];

  function createdRowCb(row, data, index){
    var day = moment().startOf('day').toDate();
    if(data.tracing){
      var tracing = moment(data.tracing).startOf('day').toDate();
      if(tracing <= day){
        $(row).addClass('highlight').children().css( "background-color", "#faadb2" );
      }
    }
  }

  function init(){
    if(vm.user.role.name === authService.USER_ROLES.STORE_MANAGER && vm.user.mainStore){
      getSellersByStore(vm.user.mainStore.id);
    }
    else{
      getQuotationDataByUser(vm.user.id)
        .then(function(values){
          var userTotals = values[0];
          var userCounts = values[1];
          setupSellerChart(userTotals, userCounts);
        })
        .catch(function(err){
          console.log('err', err);
        });
      getCurrentUserTotal(vm.user.id, {
        startDate: vm.startDate,
        endDate: vm.endDate,
      });
    }
    
  }

  function getSellersByStore(storeId){
    var deferred = $q.defer();
    storeService.getSellersByStore(storeId)
      .then(function(res){
        vm.sellers = res.data;
        vm.sellers = vm.sellers.map(function(seller){
          seller.filters = {
            User: seller.id
          };
          return seller;
        });
        return updateSellersTotals();
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

  function updateSellersTotals(){
    var deferred = $q.defer();

    if(vm.sellers){
      var params = {
        startDate: vm.startDate,
        endDate: vm.endDate,
        all: false,
        dateField: 'tracing'
      };
      var promisesTotals = vm.selers.map(function(seller){
        return quotationService.getTotalsByUser(seller.id, params);
      });

      $q.all(promisesTotals)
        .then(function(totals){
          vm.sellers = vm.sellers.map(function(seller, index){
            seller.total = totals[index].data.dateRange;
            return seller;
          });
          
          vm.store.ammounts.total = getStoreTotal(vm.sellers);

          var promises = vm.sellers.map(function(seller){
            return getQuotationDataByUser(seller.id);
          });
          return $q.all(promises);
        })
        .then(function(sellersData){

          var sellersAmounts = sellersData.map(function(data){
            return data[0];
          });
          var sellersQuantities = sellersData.map(function(data){
            return data[1];
          });
          setupStoreCharts(sellersAmounts, sellersQuantities);
          deferred.resolve();          
        })
        .catch(function(err){
          console.log(err);
          deferred.reject(err);
        });
    }else{
      deferred.resolve();
    }
    return deferred.promise;
  }  

  function getStoreTotal(sellers){
    var total = sellers.reduce(function(acum,seller){
      return acum+=seller.total;
    },0);    
    return total;
  }

  function getQuotationDataByUser(userId, dateRange){
    var deferred = $q.defer();
    var defaultDateRange = {
      startDate : false,
      endDate   : moment().endOf('day'),
      dateField : 'tracing',
      isClosed  : {'!': true}
    };
    dateRange = dateRange || defaultDateRange;
    $q.all([
      quotationService.getTotalsByUser(userId, dateRange),
      quotationService.getCountByUser(userId, dateRange)
    ])
      .then(function(result){
        console.log('result', result);
        var values = [
          result[0].data,
          result[1].data
        ];
        deferred.resolve(values);
      })
      .catch(function(err){
        console.log(err);
        deferred.reject(err);
      });

    return deferred.promise;
  }      

  function getCurrencyTooltip(tooltipItem, data){
    return data.labels[tooltipItem.index] + ': ' + $filter('currency')(data.datasets[0].data[tooltipItem.index]);
  }  

  function setupSellerChart(userTotals, userCounts){
    vm.quotationsData.dateRangeAmount = userTotals.dateRange;
    vm.quotationsData.fortnightAmount = userTotals.fortnight;
    vm.quotationsData.ammounts = {
      labels: ["Hoy", "Resto de la quincena"],
      data: [
        vm.quotationsData.dateRangeAmount,
        (vm.quotationsData.fortnightAmount - vm.quotationsData.dateRangeAmount)
      ],
      colors: ["#C92933", "#48C7DB", "#FFCE56"],
      options:{
        tooltips: {
          callbacks: {
            label: getCurrencyTooltip
          }
        }
      },
    };

    vm.quotationsData.rangeQty = userCounts.dateRange;
    vm.quotationsData.fortnightQty = userCounts.fortnight;
    vm.quotationsData.quantities = {
      labels: ["Hoy", "Resto del mes"],
      data: [
        vm.quotationsData.rangeQty,
        (vm.quotationsData.fortnightQty - vm.quotationsData.rangeQty)
      ],
      colors: ["#C92933", "#48C7DB", "#FFCE56"]
    };    
  }

  function getCurrentUserTotal(userId, dateRange){
    var deferred = $q.defer();
    var params = angular.extend(dateRange, {
      all:false,
      dateField: 'tracing'
    });
    quotationService.getTotalsByUser($rootScope.user.id, params)
      .then(function(res){
        var total = res.data.dateRange || 0;
        vm.currentUserTotal = total;
        deferred.resolve();
      })
      .catch(function(err){
        console.log(err);
        deferred.reject(err);
      });

    return deferred.promise;
  }

  function applyFilters(){
    if(vm.startDatePikaday._d || vm.endDatePikaday._d){
      vm.globalDateRange = {
        field: 'tracing',
        start: !_.isUndefined(vm.startDatePikaday._d) ? moment(vm.startDatePikaday._d).startOf('day').toDate() : false,
        end: !_.isUndefined(vm.endDatePikaday._d) ? moment(vm.endDatePikaday._d).endOf('day').toDate() : false,
      };
    }

    var promises = [
      getCurrentUserTotal(vm.user.id, {
        startDate: vm.globalDateRange.start,
        endDate: vm.globalDateRange.end,
      }),
      updateSellersTotals()
    ];

    vm.isLoading = true;
    $q.all(promises)
      .then(function(){
        $rootScope.$broadcast('reloadTable', true);
        vm.isLoading = false;
      })
      .catch(function(err){
        console.log(err);
      });
      
  }

  function onDateStartSelect(pikaday){
    vm.startDate = pikaday._d;
  }

  function onDateEndSelect(pikaday){
    vm.startDate = pikaday._d;
  }

  //@param sellers Array of seller object with dateRange and fortnight amounts and quantities
  function setupStoreCharts(sellersAmounts, sellersQuantities){
    vm.store.dateRangeAmount = sellersAmounts.reduce(function(acum, seller){
      acum += seller.dateRange;
      return acum;
    }, 0);
     vm.store.fortnightAmount = sellersAmounts.reduce(function(acum, seller){
      acum += seller.fortnight;
      return acum;
    }, 0);
    vm.store.ammounts = {
      labels: ["Hoy", "Resto de la quincena"],
      data: [
        vm.store.dateRangeAmount,
        (vm.store.fortnightAmount - vm.store.dateRangeAmount)
      ],
      colors: ["#C92933", "#48C7DB", "#FFCE56"],
      options:{
        tooltips: {
          callbacks: {
            label: getCurrencyTooltip
          }
        }
      },
    };

    vm.store.rangeQty = sellersQuantities.reduce(function(acum, seller){
      acum += seller.dateRange;
      return acum;
    }, 0);
     vm.store.fortnightQty = sellersQuantities.reduce(function(acum, seller){
      acum += seller.fortnight;
      return acum;
    }, 0);

    vm.store.quantities = {
      labels: ["Hoy", "Resto del mes"],
      data: [
        vm.store.rangeQty,
        (vm.store.fortnightQty - vm.store.rangeQty)
      ],
      colors: ["#C92933", "#48C7DB", "#FFCE56"]
    };    
  }


  function isUserAdminOrManager(){
    return $rootScope.user.role && 
      ( $rootScope.user.role.name === authService.USER_ROLES.ADMIN 
        || $rootScope.user.role.name === authService.USER_ROLES.STORE_MANAGER 
      );
  }  

  function isUserSellerOrAdmin(){
    return $rootScope.user.role && 
      ( $rootScope.user.role.name === authService.USER_ROLES.ADMIN 
        || $rootScope.user.role.name === authService.USER_ROLES.SELLER 
      );
  }  

  init();
}
