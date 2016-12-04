'use strict';

describe('Controller: ManualPiezasPlasticasCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ManualPiezasPlasticasCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ManualPiezasPlasticasCtrl = $controller('ManualPiezasPlasticasCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ManualPiezasPlasticasCtrl.awesomeThings.length).toBe(3);
  });
});
