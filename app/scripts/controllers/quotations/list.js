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
    quotationService,
    storeService
  ){

  var vm = this;
  vm.applyFilters = applyFilters;
  vm.onDateStartSelect = onDateStartSelect;
  vm.onDateEndSelect = onDateEndSelect;
  vm.getQuotationsData = getQuotationsData;
  vm.getTotalByDateRange = getTotalByDateRange;
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
      key:'Acciones',
      label:'Acciones',
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
    var monthRange = commonService.getMonthDateRange();
    var fortnightRange = commonService.getFortnightRange();
    console.log('fortnightRange', fortnightRange);
    vm.startDate = fortnightRange.start.toString();
    vm.endDate = fortnightRange.end.toString();
    vm.filters = {
      User: $rootScope.user.id,
      isClosed: {'!': true}
    };
    vm.dateRange = {
      field: 'createdAt',
      start: vm.startDate,
      end: vm.endDate
    };
    vm.user = $rootScope.user;
    vm.getQuotationsData();
    vm.getTotalByDateRange(vm.user.id, {
      startDate: vm.startDate,
      endDate: vm.endDate,
    });

    vm.getTotalByDateRange(vm.user.id, {
      startDate: vm.startDate,
      endDate: vm.endDate,
    });

    if(vm.user.role.name == 'store manager' && vm.user.mainStore){
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
        field: 'createdAt',
        start: vm.dateStart._d,
        end: moment(vm.dateEnd._d).endOf('day')
      };
    }

    vm.getTotalByDateRange(vm.user.id, {
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
        var s = vm.sellers[i];
        var params = {
          startDate: vm.dateRange.start,
          endDate: vm.dateRange.end,
          all: false
        };
        promisesTotals.push(quotationService.getTotalsByUser(s.id, params));
      }
      $q.all(promisesTotals)
        .then(function(totals){
          vm.sellers = vm.sellers.map(function(s, index){
            s.total = totals[index].data.dateRange;
            return s;
          })
        })
        .catch(function(err){
          console.log(err);
        })
    }
  }

  function getSellersByStore(storeId){
    storeService.getSellersByStore(storeId)
      .then(function(res){
        vm.sellers = res.data;
        var promisesTotals = [];
        vm.sellers = vm.sellers.map(function(s){
          s.filters = {
            User: s.id
          };
          var params = {
            startDate: vm.startDate,
            endDate: vm.endDate,
            all: false
          };
          promisesTotals.push(quotationService.getTotalsByUser(s.id, params));
          return s;
        });
        return $q.all(promisesTotals);
      })
      .then(function(totals){
        vm.sellers = vm.sellers.map(function(s, i){
          s.total = totals[i].data.dateRange;
          return s;
        });
        console.log('vm.sellers', vm.sellers)
      })
      .catch(function(err){
        console.log(err);
      });
  }

  init();
}
