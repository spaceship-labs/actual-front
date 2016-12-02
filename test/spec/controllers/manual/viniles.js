'use strict';

describe('Controller: ManualVinilesCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ManualVinilesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualVinilesCtrl = $controller('ManualVinilesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ManualVinilesCtrl.awesomeThings.length).toBe(3);
  });
});
