'use strict';

describe('Controller: ManualPinturaElectrostaticaCtrl', function () {

  // load the controller's module
  beforeEach(module('actualApp'));

  var ManualPinturaElectrostaticaCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualPinturaElectrostaticaCtrl = $controller('ManualPinturaElectrostaticaCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ManualPinturaElectrostaticaCtrl.awesomeThings.length).toBe(3);
  });
});
