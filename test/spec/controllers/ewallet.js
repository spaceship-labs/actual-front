'use strict';

describe('Controller: EwalletCtrl', function () {

  // load the controller's module
  beforeEach(module('actualApp'));

  var EwalletCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EwalletCtrl = $controller('EwalletCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(EwalletCtrl.awesomeThings.length).toBe(3);
  });
});
