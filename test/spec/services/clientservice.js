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

  it('should return false when validating a valid RFC with a date like 30/02/18', function(){
    var rfc = 'ADB300218DA0';
    var result = clientService.validateRfc(rfc, clientService.GENERIC_RFC, clientService.RFC_VALIDATION_REGEX);
    expect(result).toBe(false);
  });

  it('should return true when validating a valid RFC with a date like 28/02/18', function(){
    var rfc = 'ADB280218DA0';
    var result = clientService.validateRfc(rfc, clientService.GENERIC_RFC, clientService.RFC_VALIDATION_REGEX);
    expect(result).toBe(true);
  });

});
