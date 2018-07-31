'use strict';

describe('Controller: EventwishlistCreateCtrl', function () {

  // load the controller's module
  beforeEach(module('actualApp'));

  var EventwishlistCreateCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EventwishlistCreateCtrl = $controller('EventwishlistCreateCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(EventwishlistCreateCtrl.awesomeThings.length).toBe(3);
  });
});
