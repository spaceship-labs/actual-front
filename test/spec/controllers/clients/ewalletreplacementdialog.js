'use strict';

describe('Controller: ClientsEwalletreplacementdialogCtrl', function () {

  // load the controller's module
  beforeEach(module('actualApp'));

  var ClientsEwalletreplacementdialogCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ClientsEwalletreplacementdialogCtrl = $controller('ClientsEwalletreplacementdialogCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ClientsEwalletreplacementdialogCtrl.awesomeThings.length).toBe(3);
  });
});
