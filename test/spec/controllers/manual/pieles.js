'use strict';

describe('Controller: ManualPielesCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ManualPielesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualPielesCtrl = $controller('ManualPielesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ManualPielesCtrl.awesomeThings.length).toBe(3);
  });
});
