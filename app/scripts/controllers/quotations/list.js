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
  vm.getQuotationsData = getQuotationsData;
  vm.isUserAdminOrManager = isUserAdminOrManager;
  vm.isUserSellerOrAdmin  = isUserSellerOrAdmin; 

  vm.filters = false;
  vm.dateEnd = false;
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


  function getQuotationsData(){
    var dateRange = {
      startDate: moment().startOf('day'),
      endDate: moment().endOf('day'),
    };
    quotationService.getTotalsByUser($rootScope.user.id, dateRange)
      .then(function(res){
        vm.quotationsData.todayAmmount = res.data.dateRange;
        vm.quotationsData.fortnightAmount = res.data.fortnight;
        vm.quotationsData.ammounts = {
          labels: ["Hoy", "Resto de la quincena"],
          data: [
            vm.quotationsData.todayAmmount,
            (vm.quotationsData.fortnightAmount - vm.quotationsData.todayAmmount)
          ],
          colors: ["#C92933", "#48C7DB", "#FFCE56"],
          options:{
            tooltips: {
              callbacks: {
                label: function(tooltipItem, data) {
                  return data.labels[tooltipItem.index] + ': ' + $filter('currency')(data.datasets[0].data[tooltipItem.index]);
                }
              }
            }
          },

        };
      });

    quotationService.getCountByUser($rootScope.user.id, dateRange)
      .then(function(res){
        vm.quotationsData.todayQty = res.data.dateRange;
        vm.quotationsData.rangeQty = res.data.fortnight;
        vm.quotationsData.quantities = {
          labels: ["Hoy", "Resto del mes"],
          data: [
            vm.quotationsData.todayQty,
            (vm.quotationsData.rangeQty - vm.quotationsData.todayQty)
          ],
          colors: ["#C92933", "#48C7DB", "#FFCE56"]
        };
      });
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
    getQuotationsData();
    getTotalByDateRange(vm.user.id, {
      startDate: vm.startDate,
      endDate: vm.endDate,
    });

    if(vm.user.role.name === authService.USER_ROLES.STORE_MANAGER && vm.user.mainStore){
      getSellersByStore(vm.user.mainStore.id);
    }

    vm.listScopes = [
      {label: 'Mis oportunidades', value: vm.user.id},
      {label: 'Todas las oportunidades', value:'none'}
    ];
    
  }

  function getTotalByDateRange(userId, dateRange){
    var params = angular.extend(dateRange, {all:false});
    quotationService.getTotalsByUser($rootScope.user.id, params)
      .then(function(res){
        vm.totalDateRange = res.data.dateRange || 0;
      })
      .catch(function(err){
        console.log(err);
      });
  }

  function applyFilters(){
    if(vm.dateStart._d && vm.dateEnd._d){
      vm.dateRange = {
        field: 'tracing',
        start: vm.dateStart._d,
        end: moment(vm.dateEnd._d).endOf('day')
      };
    }

    getTotalByDateRange(vm.user.id, {
      startDate: vm.dateRange.start,
      endDate: vm.dateRange.end,
    });
    updateSellersTotals();
    $rootScope.$broadcast('reloadTable', true);
  }

  function onDateStartSelect(pikaday){
    console.log(pikaday);
  }

  function onDateEndSelect(pikaday){
    console.log(pikaday);
  }

  function updateSellersTotals(){
    if(vm.sellers){
      var promisesTotals = [];
      for(var i = 0; i< vm.sellers.length; i++){
        var seller = vm.sellers[i];
        var params = {
          startDate: vm.dateRange.start,
          endDate: vm.dateRange.end,
          all: false
        };
        promisesTotals.push(quotationService.getTotalsByUser(seller.id, params));
      }
      $q.all(promisesTotals)
        .then(function(totals){
          vm.sellers = vm.sellers.map(function(seller, index){
            seller.total = totals[index].data.dateRange;
            return seller;
          });
        })
        .catch(function(err){
          console.log(err);
        });
    }
  }

  function getSellersByStore(storeId){
    storeService.getSellersByStore(storeId)
      .then(function(res){
        var promisesTotals = [];
        vm.sellers = res.data;
        vm.sellers = vm.sellers.map(function(seller){
          seller.filters = {
            User: seller.id
          };
          var params = {
            startDate: vm.startDate,
            endDate: vm.endDate,
            all: false
          };
          promisesTotals.push(quotationService.getTotalsByUser(seller.id, params));
          return seller;
        });
        return $q.all(promisesTotals);
      })
      .then(function(totals){
        vm.sellers = vm.sellers.map(function(seller, i){
          seller.total = totals[i].data.dateRange;
          return seller;
        });
      })
      .catch(function(err){
        console.log(err);
      });
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
