'use strict';

describe('Controller: ManualCtrl', function () {

  // load the controller's module
  beforeEach(module('actualApp'));

  var ManualCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualCtrl = $controller('ManualCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ManualCtrl.awesomeThings.length).toBe(3);
  });
});
