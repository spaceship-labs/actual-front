'use strict';

describe('Controller: ManualCristalesCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ManualCristalesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualCristalesCtrl = $controller('ManualCristalesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ManualCristalesCtrl.awesomeThings.length).toBe(3);
  });
});
