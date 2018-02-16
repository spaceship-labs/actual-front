(function (){
	'use strict';

	angular
		.module('actualApp')
		.factory('productSearchService', productSearchService);
    /** @ngInject */
    function productSearchService($location){
			var SORT_OPTIONS = [
				{
					label:'Lo más vendido',
					key: 'salesCount'
				},
				{
					label:'Disponibilidad',
					key: 'stock',
					direction: 'ASC'
				},
				{
					label:'Precio',
					key: 'DiscountPrice',
					direction: 'ASC'
				},
				{
					label:'Promociones',
					key: 'slowMovement',
					direction: 'DESC'
				},
			];

			var DISCOUNT_OPTIONS = [
				10, 15, 20, 25, 30, 35
			];

			var stockRanges = [
					[1, 10],
					[11, 30],
					[31, 90],
					[91, 270],
					[271, Infinity]
			];

			var DISCOUNTS_SEARCH_OPTIONS = DISCOUNT_OPTIONS.map(function(option){
				return {
					label: option + '%',
					value: option
				};
			});


			var STOCK_SEARCH_OPTIONS = stockRanges.map(function(range){
				var rangeMaxLabel = (range[1] === Infinity) ? "más" : range[1];
				return {
					label: range[0] + '-' + rangeMaxLabel,
					value: range,
					id: range[0] + '_' + range[1]
				};
			});

			var SOCIETY_OPTIONS = [
				{label: 'Studio', code: '001'},
				{label: 'Home', code: '002'},
				{label: 'Kids', code: '004'},
				{label: 'Ambas(Studio+Home)', code: '003'},
			];

			function getSearchValuesByFilters(filters){
				var searchValues = filters.reduce(function(acum, filter){					
					var selectedValues = filter.Values.filter(function(value){
						return value.selected;
					});
					acum = acum.concat(selectedValues);
					return acum;
				},[]);
				return searchValues;
			}

			function getSearchValuesIds(searchValues){
				var searchValuesIds = searchValues.map(function(value){
					return value.id;
				});
				return searchValuesIds;
			}

			function persistParamsOnUrl(params){
				var currentPath = $location.path();
				var currentParams = $location.search();
				currentParams = _.extend(currentParams, params);
				$location.path(currentPath, false).search(currentParams);						
			}


			var service = {
				getSearchValuesByFilters: getSearchValuesByFilters,
				getSearchValuesIds: getSearchValuesIds,
				persistParamsOnUrl: persistParamsOnUrl,
				DISCOUNTS_SEARCH_OPTIONS:DISCOUNTS_SEARCH_OPTIONS,
				STOCK_SEARCH_OPTIONS: STOCK_SEARCH_OPTIONS,
				SORT_OPTIONS: SORT_OPTIONS,
				SOCIETY_OPTIONS: SOCIETY_OPTIONS,
				SEARCH_ITEMS: 10,
			};        

			return service;
    }
})();
