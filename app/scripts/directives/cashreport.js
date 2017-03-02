'use strict';

/**
 * @ngdoc directive
 * @name dashexampleApp.directive:cashReport
 * @description
 * # cashReport
 */
angular.module('dashexampleApp')
  .directive('cashReport', function (
  	commonService, 
  	paymentService, 
  	authService,
  	dialogService,
  	storeService,
  	$q,
  	$window
  	) {
    return {
      templateUrl: 'views/directives/cash-report/cash-report.html',
      restrict: 'E',
      replace: true,
      scope:{
        user: '=',
      },
      controller: [
    	'$scope',
	  	'commonService', 
	  	'paymentService', 
	  	'authService',
	  	'dialogService',
	  	'storeService',
	  	'$q',
	  	'$window',
      function postLink(
	    	$scope,
		  	commonService, 
		  	paymentService, 
		  	authService,
		  	dialogService,
		  	storeService,
		  	$q,
		  	$window      	
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
			    isStoreManager: authService.isStoreManager,
			    isTransferOrDeposit: paymentService.isTransferOrDeposit,
			    isUsdPayment: paymentService.isUsdPayment,
			    isUserAdminOrManager: authService.isUserAdminOrManager,
			    mapTerminalCode: commonService.mapTerminalCode,
      		onSelectStartDate: onSelectStartDate,
      		onSelectEndDate: onSelectEndDate,
			    paymentTypes: paymentService.types,
    			paymentRequiresBankColumn: paymentRequiresBankColumn,
			    print: print,
			    requiresBankColumn: requiresBankColumn,

      	});

      	$scope.init();

			  function print(){
			    $window.print();
			  }      	

      	function init(){
      		console.log('cashReport');
			    var monthRange = commonService.getMonthDateRange();
			    $scope.startDate = moment().startOf('day');
			    $scope.endDate = moment().endOf('day');
			    $scope.startTime = moment().startOf('day');
			    $scope.endTime = moment().endOf('day');
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

			    if(authService.isAdmin($scope.user)){
			      promises = [
			        paymentService.getPaymentMethodsGroups(),
			        storeService.getStoresCashReport(params)
			      ];
			    }
			    else if( authService.isStoreManager($scope.user) ){
			      promises = [
			        paymentService.getPaymentMethodsGroups(),      
			        storeService.getStoreCashReport($scope.user.mainStore.id, params)
			      ];
			    }

			    $scope.isLoadingReport = true;

			    $q.all(promises)
			      .then(function(results){
			        console.log('results', results);
			        var paymentsGroups = results[0].data;

			        if( authService.isStoreManager($scope.user) ){
			          $scope.sellers = results[1].data;          
			          $scope.sellers = $scope.sellers.map(function(seller){
			            seller.paymentsGroups = _.clone(paymentsGroups);
			            seller.paymentsGroups = mapMethodGroupsWithPayments(seller.Payments, seller.paymentsGroups);
			            return seller;
			          });
			        }

			        else if(authService.isAdmin($scope.user)){
			          $scope.stores = results[1].data;          
			          $scope.stores = $scope.stores.map(function(store){
			            store.paymentsGroups = _.clone(paymentsGroups);
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

			  function filterStores(stores){
			    if($scope.storeFilter === 'all'){
			      return stores;
			    }
			    else{
			      return stores.filter(function(store){
			        return store.id === $scope.storeFilter;
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
			    var methods = _.map(auxGroups, function(group){
			      return {
			        type: group[0].type,
			        name: group[0].name,
			        label: group[0].type,
			        terminal: group[0].terminal,
			        msi: group[0].msi,
			        payments: group,
			        groupNumber: group[0].group,
			        currency: group[0].currency,
			      };
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
			      groups.push({
			        groupNumber: sortedMethods[0].groupNumber,
			        msi: sortedMethods[0].msi || 0,
			        methods: sortedMethods
			      });
			    }
			    
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
			    var total = method.payments.reduce(function(acum, current){
			      acum += current.ammount;
			      return acum;
			    },0);
			    return total;    
			  }

			  function getTotalByMethod(method){
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

			  function getSellersTotal(){
			    var sellersTotal = $scope.sellers.reduce(function(acum, seller){
			      acum += getSellerTotal(seller);
			      return acum;
			    }, 0);
			    return sellersTotal;
			  }

			  function getSellerTotal(seller){
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
