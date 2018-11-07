'use strict';

/**
 * @ngdoc filter
 * @name actualApp.filter:numberwithcomma
 * @function
 * @description
 * # numberwithcomma
 * Filter in the actualApp.
 */
angular.module('actualApp').filter('numberwithcomma', function() {
  return function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
});
