'use strict';

describe('Service: clientService', function () {

  // load the service's module
  beforeEach(module('actualApp'));

  // instantiate service
  var clientService;
  beforeEach(inject(function (_clientService_) {
    clientService = _clientService_;
  }));

  it('should return false when validating a wrong RFC', function(){
    var rfc = 'wrong.rfc';
    var result = clientService.validateRfc(rfc, clientService.GENERIC_RFC, clientService.RFC_VALIDATION_REGEX);
    expect(result).toBe(false);
  });

  it('should return true when validating a valid RFC', function(){
    var rfc = 'ADB301218DA0';
    var result = clientService.validateRfc(rfc, clientService.GENERIC_RFC, clientService.RFC_VALIDATION_REGEX);
    expect(result).toBe(true);
  });
});
