(function (){
  'use strict';

  angular
    .module('dashexampleApp')
    .factory('cartService', cartService);

  function cartService(
  	$rootScope, 
  	$location,
  	localStorageService, 
  	quotationService,
  	deliveryService
  ){
    var service = {    
    	getProductCartItems: getProductCartItems,
			resetProductCartQuantity: resetProductCartQuantity    	
    };

	  function resetProductCartQuantity(productCart){
	    var available = productCart.deliveryGroup.available;
	    if(productCart.quantity >= available){
	      productCart.quantity = available;
	    }
	    else if(!productCart.quantity && available){
	      productCart.quantity = 1;
	    }
	    return productCart;
	  }

	  function getProductCartItems(deliveryGroup, quantity, warehouses, activeStoreWarehouse){
	    var productCartItems = [];
	     if(deliveryGroup.deliveries.length === 1){
	      var productCartItem = deliveryGroup.deliveries[0];
	      productCartItem.quantity = quantity;
	      productCartItems.push( productCartItem );
	    }else{
	      var deliveries = deliveryService.sortDeliveriesByHierarchy(
	        deliveryGroup.deliveries, 
	        warehouses,
	        activeStoreWarehouse
	      );
	      
	      productCartItems = deliveries.map(function(delivery){
	        if(quantity > delivery.available){
	          delivery.quantity = delivery.available;
	          quantity -= delivery.available;
	        }else{
	          delivery.quantity = quantity;
	          quantity = 0;
	        }
	        return delivery;
	      });

	      productCartItems = productCartItems.filter(function(item){
	        return item.quantity > 0;
	      });

	    } 
	    return productCartItems;
	  }	  

    return service;


  }

})();
