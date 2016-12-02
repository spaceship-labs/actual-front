'use strict';

describe('Controller: ManualAliminiosCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ManualAliminiosCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualAliminiosCtrl = $controller('ManualAliminiosCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ManualAliminiosCtrl.awesomeThings.length).toBe(3);
  });
});
