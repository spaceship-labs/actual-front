'use strict';

describe('Controller: ManualVinilosCtrl', function () {

  // load the controller's module
  beforeEach(module('actualApp'));

  var ManualVinilosCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualVinilosCtrl = $controller('ManualVinilosCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ManualVinilosCtrl.awesomeThings.length).toBe(3);
  });
});
