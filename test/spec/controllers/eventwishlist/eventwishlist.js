'use strict';

describe('Controller: EventwishlistEventwishlistCtrl', function () {

  // load the controller's module
  beforeEach(module('actualApp'));

  var EventwishlistEventwishlistCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EventwishlistEventwishlistCtrl = $controller('EventwishlistEventwishlistCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(EventwishlistEventwishlistCtrl.awesomeThings.length).toBe(3);
  });
});
