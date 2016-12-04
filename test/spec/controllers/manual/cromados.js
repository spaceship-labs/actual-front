'use strict';

describe('Controller: ManualCromadosCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ManualCromadosCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualCromadosCtrl = $controller('ManualCromadosCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ManualCromadosCtrl.awesomeThings.length).toBe(3);
  });
});
