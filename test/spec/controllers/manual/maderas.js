'use strict';

describe('Controller: ManualMaderasCtrl', function () {

  // load the controller's module
  beforeEach(module('actualApp'));

  var ManualMaderasCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualMaderasCtrl = $controller('ManualMaderasCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ManualMaderasCtrl.awesomeThings.length).toBe(3);
  });
});
