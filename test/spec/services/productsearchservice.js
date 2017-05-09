'use strict';

describe('Service: productSearchService', function () {

  // load the service's module
  beforeEach(module('dashexampleApp'));

  // instantiate service
  var productSearchService;
  beforeEach(inject(function (_productSearchService_) {
    productSearchService = _productSearchService_;
  }));

  it('should do something', function () {
    expect(!!productSearchService).toBe(true);
  });

});
