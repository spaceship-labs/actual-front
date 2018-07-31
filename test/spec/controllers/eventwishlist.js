'use strict';

describe('Controller: EventwishlistCtrl', function () {

  // load the controller's module
  beforeEach(module('actualApp'));

  var EventwishlistCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EventwishlistCtrl = $controller('EventwishlistCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(EventwishlistCtrl.awesomeThings.length).toBe(3);
  });
});
