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
  vm.applyFilters = applyFilters;
  vm.onDateStartSelect = onDateStartSelect;
  vm.onDateEndSelect = onDateEndSelect;
  vm.isUserAdminOrManager = isUserAdminOrManager;
  vm.isUserSellerOrAdmin  = isUserSellerOrAdmin; 

  vm.filters = false;
  vm.dateEnd = false;
  vm.store   = {
    ammounts: {}
  };
  vm.defaultSort = [6, 'asc'];
  vm.columnsLeads = [
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
  ];
  vm.quotationsData = {};
  vm.apiResourceLeads = quotationService.getList;
  vm.listScopes = [];
  vm.closedOptions = [
    {label: 'Abiertas', value: {'!': true}},
    {label:'Cerradas', value: true}
  ];

  vm.createdRowCb = function(row, data, index){
    var day = moment().startOf('day').toDate();
    if(data.tracing){
      var tracing = moment(data.tracing).startOf('day').toDate();
      if(tracing <= day){
        $(row).addClass('highlight').children().css( "background-color", "#faadb2" );
      }
    }
  };

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

  function init(){
    vm.startDate = false;
    vm.endDate   = false;
    vm.filters = {
      User: $rootScope.user.id,
      isClosed: {'!': true}
    };
    vm.dateRange = {
      field: 'tracing',
      start: vm.startDate,
      end: vm.endDate
    };
    vm.user = $rootScope.user;

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
      console.log('getting total by dateRange');
      getTotalByDateRange(vm.user.id, {
        startDate: vm.startDate,
        endDate: vm.endDate,
      });
    }

    vm.listScopes = [
      {label: 'Mis oportunidades', value: vm.user.id},
      {label: 'Todas las oportunidades', value:'none'}
    ];
    
  }

  function getTotalByDateRange(userId, dateRange){
    var deferred = $q.defer();
    var params = angular.extend(dateRange, {
      all:false,
      dateField: 'tracing'
    });
    quotationService.getTotalsByUser($rootScope.user.id, params)
      .then(function(res){
        vm.totalDateRange = res.data.dateRange || 0;
        deferred.resolve();
      })
      .catch(function(err){
        console.log(err);
        deferred.reject(err);
      });

    return deferred.promise;
  }

  function applyFilters(){
    if(vm.dateStart._d || vm.dateEnd._d){
      vm.dateRange = {
        field: 'tracing',
        start: !_.isUndefined(vm.dateStart._d) ? moment(vm.dateStart._d).startOf('day').toDate() : false,
        end: !_.isUndefined(vm.dateEnd._d) ? moment(vm.dateEnd._d).endOf('day').toDate() : false,
      };
    }

    var promises = [
      getTotalByDateRange(vm.user.id, {
        startDate: vm.dateRange.start,
        endDate: vm.dateRange.end,
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
    console.log(pikaday);
  }

  function onDateEndSelect(pikaday){
    console.log(pikaday);
  }

  function setupStoreCharts2(sellers){
    vm.store.ammounts = {
      total: sellers.reduce(function(acum,seller){return acum+=seller.total;},0),
      labels: sellers.map(function(seller){return seller.firstName + ' ' + seller.lastName;}),
      data: sellers.map(function(seller){return seller.total;}),
      options:{
        legend:{
          display:true,
          position: 'bottom'
        },
        tooltips: {
          callbacks: {
            label: getCurrencyTooltip
          }
        }
      },
    };  
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



  function updateSellersTotals(){
    var deferred = $q.defer();

    if(vm.sellers){
      var promisesTotals = [];
      for(var i = 0; i< vm.sellers.length; i++){
        var seller = vm.sellers[i];
        var params = {
          startDate: vm.startDate,
          endDate: vm.endDate,
          all: false,
          dateField: 'tracing'
        };
        promisesTotals.push(
          quotationService.getTotalsByUser(seller.id, params)
        );
      }
      $q.all(promisesTotals)
        .then(function(totals){
          vm.sellers = vm.sellers.map(function(seller, index){
            seller.total = totals[index].data.dateRange;
            return seller;
          });
          vm.store.ammounts.total = vm.sellers.reduce(function(acum,seller){
            return acum+=seller.total;
          },0);
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

  function getSellersByStore(storeId){
    var deferred = $q.defer();
    storeService.getSellersByStore(storeId)
      .then(function(res){
        var promisesTotals = [];
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
