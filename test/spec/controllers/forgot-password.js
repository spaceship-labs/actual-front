'use strict';

describe('Controller: ForgotPasswordCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ForgotPasswordCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ForgotPasswordCtrl = $controller('ForgotPasswordCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ForgotPasswordCtrl.awesomeThings.length).toBe(3);
  });
});
