'use strict';

describe('Controller: CancellationsCtrl', function () {

  // load the controller's module
  beforeEach(module('actualApp'));

  var CancellationsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CancellationsCtrl = $controller('CancellationsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CancellationsCtrl.awesomeThings.length).toBe(3);
  });
});
