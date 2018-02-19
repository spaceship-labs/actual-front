'use strict';

/**
 * @ngdoc directive
 * @name actualApp.directive:cashReport
 * @description
 * # cashReport
 */
angular.module('actualApp')
  .directive('cashReport', function (
  	commonService, 
  	paymentService, 
  	authService,
  	dialogService,
  	storeService,
  	siteService,
  	$q
  	) {
    return {
      templateUrl: 'views/directives/cash-report/cash-report.html',
      restrict: 'E',
      replace: true,
      scope:{
        user: '=',
        print: '='
      },
      controller: [
    	'$scope',
	  	'commonService', 
	  	'paymentService', 
	  	'authService',
	  	'dialogService',
	  	'storeService',
	  	'siteService',
	  	'$q',
      function postLink(
	    	$scope,
		  	commonService, 
		  	paymentService, 
		  	authService,
		  	dialogService,
		  	storeService,
		  	siteService,
		  	$q
      ) {

      	angular.extend($scope,{
      		init: init,
			    filterStores: filterStores,
			    getAllStoresTotal: getAllStoresTotal,
			    getCashReport:  getCashReport,
			    getSellersTotal: getSellersTotal,
			    getSellerTotal: getSellerTotal,
			    getStoreTotal: getStoreTotal,
			    getTotalByGroup: getTotalByGroup,
			    getTotalByMethod: getTotalByMethod,
			    getTotalByMethodUSD: getTotalByMethodUSD,
			    isAdmin: authService.isAdmin,
					isSinglePlaymentTerminal : paymentService.isSinglePlaymentTerminal,
					isCardCreditOrDebitPayment: paymentService.isCardCreditOrDebitPayment,
			    isStoreManager: authService.isStoreManager,
			    isTransferOrDeposit: paymentService.isTransferOrDeposit,
			    isUsdPayment: paymentService.isUsdPayment,
			    isUserAdminOrManager: authService.isUserAdminOrManager,
			    mapTerminalCode: commonService.mapTerminalCode,
      		onSelectStartDate: onSelectStartDate,
      		onSelectEndDate: onSelectEndDate,
			    paymentTypes: paymentService.types,
    			paymentRequiresBankColumn: paymentRequiresBankColumn,
			    requiresBankColumn: requiresBankColumn,
			    isWebStore: isWebStore
      	});

      	$scope.init();

      	function init(){
			    var monthRange = commonService.getMonthDateRange();
			    $scope.startDate = moment().startOf('day');
			    $scope.endDate = moment().endOf('day');
			    $scope.startTime = moment().startOf('day');
			    $scope.endTime = moment().endOf('day');
			    $scope.storeFilter = 'all';
			  };

			  function onSelectStartDate(pikaday){
			    $scope.startDate = pikaday._d;
			    //$scope.myPickerEndDate.setMinDate($scope.startDate);
			  }

			  function onSelectEndDate(pikaday){
			    $scope.endDate = pikaday._d;
			    //$scope.myPickerStartDate.setMaxDate($scope.endDate);
			  }			


			  function getCashReport(){
			    $scope.startDate = commonService.combineDateTime($scope.startDate,$scope.startTime);
			    $scope.endDate = commonService.combineDateTime($scope.endDate,$scope.endTime,59);
			    
			    var params = {
			      startDate: $scope.startDate,
			      endDate: $scope.endDate
			    };

			    var promises = [];
			    $scope.isManagerReport = authService.isStoreManager($scope.user);
			    $scope.isGeneralReport = authService.isAdmin($scope.user);

			    if( $scope.isGeneralReport ){
			      promises = [
			        paymentService.getPaymentMethodsGroups({
								readLegacyMethods:true,
								readCreditMethod: true
							}),
			        storeService.getStoresCashReport(params),
			        siteService.getSitesCashReport(params),
			        paymentService.getPaymentWebMethodsGroups()
			      ];
			    }
			    else if( $scope.isManagerReport ){
			      promises = [
			        paymentService.getPaymentMethodsGroups({
								readLegacyMethods:true,
								readCreditMethod: true
							}),      
			        storeService.getManagerCashReport(params),
			        paymentService.getPaymentWebMethodsGroups()
			      ];
			    }

			    $scope.isLoadingReport = true;

			    $q.all(promises)
			      .then(function(results){
			        console.log('results', results);
			        var paymentsGroups = results[0].data;
			        var paymentsWebGroups = results[2].data;

			        if( $scope.isManagerReport ){
			          $scope.stores = results[1].data;          
								$scope.stores = $scope.stores.map(function(store){

									if(isWebStore(store) ){
										store.paymentsGroups = _.clone(paymentsWebGroups);
										store.paymentsGroups = mapMethodGroupsWithPayments(store.PaymentsWeb, store.paymentsGroups);
					          return store;
				        	}
				        	else{
					          store.Sellers = store.Sellers.map(function(seller){
					            seller.paymentsGroups = _.clone(paymentsGroups);
					            seller.paymentsGroups = mapMethodGroupsWithPayments(seller.Payments, seller.paymentsGroups);
					            return seller;
					          });
					          return store;				        		
				        	}
				        });
			        }

			        else if( $scope.isGeneralReport ){
			          $scope.stores = results[1].data;    
			          var sites = results[2].data;
			          var paymentsWebGroups = results[3].data;

			          $scope.stores = assingSitesReport($scope.stores, sites);

			          $scope.stores = $scope.stores.map(function(store){
			            store.paymentsGroups = _.clone(paymentsGroups);

			            if( isWebStore(store) ){
			            	store.paymentsGroups = _.clone(paymentsWebGroups);
			            }

			            store.paymentsGroups = mapMethodGroupsWithPayments(store.Payments, store.paymentsGroups);
			            return store;
			          });          
			        }

			        console.log('$scope.sellers', $scope.sellers);
			        console.log('$scope.stores', $scope.stores);
			      
			        $scope.isLoadingReport = false;
			      })
			      .catch(function(err){
			        console.log(err);
			        authService.showUnauthorizedDialogIfNeeded(err);        
			        $scope.isLoadingReport = false;
			        var error = err.data || err;
			        error = error ? error.toString() : '';
			        dialogService.showDialog('Hubo un error: ' + error );           
			      });

			  }

			  function assingSitesReport(stores, sites){
			  	var storesNames = [
			  		'actualstudio.com',
			  		'actualhome.com',
			  		'actualkids.com'
			  	];
          //Stores substract 
          stores = stores.filter(function(store){
          	return storesNames.indexOf(store.name) === -1;
          });			

          sites = sites.map(function(site){
          	site.Payments = site.PaymentsWeb;
          	return site;
          });

          stores = stores.concat(sites);
          return stores;
			  }

				function isWebStore(store){
			  	var storesNames = [
			  		'actualstudio.com',
			  		'actualhome.com',
			  		'actualkids.com'
			  	];
			  	return storesNames.indexOf(store.name) > -1;					
				}			  

			  function requiresBankColumn(method){
			    return (method.groupNumber !== 1 || 
			        $scope.isTransferOrDeposit(method) || 
			        $scope.isSinglePlaymentTerminal(method)
			    );
			  }

			  function paymentRequiresBankColumn(payment){
			    return ($scope.isSinglePlaymentTerminal(payment) || 
			      payment.msi || 
			      $scope.isTransferOrDeposit(payment)
			    );

			  }

			  function filterStores(stores, storeFilter){
			    if(storeFilter === 'all'){
			      return stores;
			    }
			    else{
			      return stores.filter(function(store){
			        return store.id === storeFilter;
			      });
			    }
			  }


			  function mapMethodGroupsWithPayments(payments, methodGroups){
			    var groups = [];
			    var auxGroups = _.groupBy(payments, function(payment){
			      if( $scope.isTransferOrDeposit(payment) ){
			        return payment.type;
			      }

			      return payment.type + '#' + payment.terminal;
					});
					console.log('auxGroups', auxGroups);
			    var methods = _.map(auxGroups, function(group){
			      var method = {
			        type: group[0].type,
			        name: group[0].name,
			        label: group[0].type,
			        terminal: group[0].terminal,
			        msi: group[0].msi,
			        payments: group,
			        groupNumber: group[0].group,
			        currency: group[0].currency,
			        card: group[0].card || false
			      };

			      if($scope.isManagerReport){
				      if(method.type === paymentService.types.CASH){
				      	method.name = 'Efectivo';
				      }

				      if(method.type === paymentService.types.CASH_USD){
				      	method.name = 'Efectivo';
				      }
				    }

			      return method;
			    });

			    var paymentsGroups = _.groupBy(methods, function(method){
			      if(method.groupNumber === 1){
			        return method.groupNumber;
			      }
			      else{
			        return method.groupNumber + '#' + method.type;
			      }
			    });

			    for(var key in paymentsGroups){
			      var sortedMethods = sortMethodsByGroup(paymentsGroups[key], key, methodGroups);
						
						if(sortedMethods.length > 0){			      
				      groups.push({
				        groupNumber: sortedMethods[0].groupNumber,
				        msi: sortedMethods[0].msi || 0,
				        methods: sortedMethods
				      });
				    }
			    }

			    console.log('groups', groups);
			    
			    groups = _.sortBy(groups, 'msi');
			    return groups;
			  }

			  function sortMethodsByGroup(methods, groupNumber, methodGroups){
			    var sorted = [];
			    groupNumber = parseInt(groupNumber);
			    var group = _.findWhere(methodGroups, {group: groupNumber});
			    for(var i = 0; i< group.methods.length; i++){
			      var matches = _.where(methods, {type: group.methods[i].type});
			      if(matches && matches.length > 0){
			        sorted = sorted.concat(matches);
			      }      
			    }
			    return sorted;
			  }

			  function getTotalByMethodUSD(method){
			  	if(!method.payments){
			  		return 0;
			  	}

			    var total = method.payments.reduce(function(acum, current){
			      acum += current.ammount;
			      return acum;
			    },0);
			    return total;    
			  }

			  function getTotalByMethod(method){
			  	if(!method.payments){
			  		return 0;
			  	}

			    var total = method.payments.reduce(function(acum, current){
			      if(current.currency === paymentService.currencyTypes.USD){
			        acum += (current.ammount * current.exchangeRate);
			      }else{
			        acum += current.ammount;
			      }
			      return acum;
			    },0);
			    return total;
			  }

			  function getTotalByGroup(group){
			    var total = group.methods.reduce(function(acum, method){
			      return acum += getTotalByMethod(method);
			    },0);
			    return total;
			  }

			  function getSellersTotal(sellers){
			  	sellers = sellers || [];
			    var sellersTotal = sellers.reduce(function(acum, seller){
			      acum += getSellerTotal(seller);
			      return acum;
			    }, 0);
			    return sellersTotal;
			  }

			  function getSellerTotal(seller){
			  	if(!seller.paymentsGroups){
			  		return 0;
			  	}

			    var generalTotal = seller.paymentsGroups.reduce(function(acum, group){
			      acum += getTotalByGroup(group);
			      return acum;
			    },0);
			    return generalTotal;
			  }


			  function getStoreTotal(store){
			    var storeTotal = store.paymentsGroups.reduce(function(acum, group){
			      acum += getTotalByGroup(group);
			      return acum;
			    },0);
			    return storeTotal;
			  }

			  function getAllStoresTotal(){
			    var storesTotal = $scope.stores.reduce(function(acum, store){
			      acum += getStoreTotal(store);
			      return acum;
			    },0);
			    return storesTotal;
			  }  			    

      }]
    };
  });
