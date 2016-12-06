'use strict';

describe('Controller: ManualTextilesCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ManualTextilesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualTextilesCtrl = $controller('ManualTextilesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ManualTextilesCtrl.awesomeThings.length).toBe(3);
  });
});