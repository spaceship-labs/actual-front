'use strict';

describe('Controller: ManualAcerosCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ManualAcerosCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualAcerosCtrl = $controller('ManualAcerosCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ManualAcerosCtrl.awesomeThings.length).toBe(3);
  });
});
