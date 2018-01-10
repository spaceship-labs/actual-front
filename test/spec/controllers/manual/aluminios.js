'use strict';

describe('Controller: ManualAluminiosCtrl', function () {

  // load the controller's module
  beforeEach(module('actualApp'));

  var ManualAluminiosCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualAluminiosCtrl = $controller('ManualAluminiosCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ManualAluminiosCtrl.awesomeThings.length).toBe(3);
  });
});
