'use strict';

/**
 * @ngdoc directive
 * @name actualApp.directive:menuSubCategories
 * @description
 * # menuSubCategories
 */
angular.module('actualApp')
  .directive('menuSubCategories', function () {
    return {
      templateUrl: 'views/directives/menu-subcategories.html',
      restrict: 'E',
      scope:{
        parentCategory: '='
      },
      link: function postLink(scope, element, attrs) {
      }
    };
  });
