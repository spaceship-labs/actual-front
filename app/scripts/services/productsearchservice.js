(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('productSearchService', productSearchService);

    /** @ngInject */
    function productSearchService(){

	  	var service = {
	  		getSearchValuesIdsByFilters: getSearchValuesIdsByFilters
	  	};

	  	function getSearchValuesIdsByFilters(filters){
	      var searchValuesIds = filters.reduce(function(acum, filter){
	      	
	      	var selectedValues = filter.Values.filter(function(value){
	      		return value.selected;
	      	});

	      	var selectedValuesIds = selectedValues.map(function(value){
	      		return value.id;
	      	});

	      	acum.concat(selectedValuesIds);
	      	return acum;
	      },[]);

	      return searchValuesIds;
	  	}


	  	return service;

    }


})();
