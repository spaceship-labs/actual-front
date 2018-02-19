'use strict';

describe('Controller: CheckoutPaymentsCtrl', function () {

  // load the controller's module
  beforeEach(module('actualApp'));

  var CheckoutPaymentsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CheckoutPaymentsCtrl = $controller('CheckoutPaymentsCtrl', {
      $scope: scope,
      activeStore: {},
      activeQuotation:{}
      // place here mocked dependencies
    });
  }));

  it('should validate to true the quotation address when it has immediate delivery', function(){
    var quotation = {immediateDelivery: true}
    var result = CheckoutPaymentsCtrl.isValidQuotationAddress(quotation);
    expect(result).toBe(true);
  })

  it('should validate to true the quotation address when it has an address', function(){
    var quotation = {Address: {}}
    var result = CheckoutPaymentsCtrl.isValidQuotationAddress(quotation);
    expect(result).toBe(true);
  });

  it('should return true on isPaymentModeActive validation when quotation amount paid is not 100%', function(){
    var quotation = {
      ammountPaid: 50,
      total: 100
    };
    var payment = {ammount:20};
    var result = CheckoutPaymentsCtrl.isPaymentModeActive(payment, quotation);
    expect(result).toBe(true);
  });

  it('should return false on isPaymentModeActive validation when quotation amount paid is 100%', function(){
    var quotation = {
      ammountPaid: 100,
      total: 100
    };
    var payment = {ammount:20};
    var result = CheckoutPaymentsCtrl.isPaymentModeActive(payment, quotation);
    expect(result).toBe(false);
  });

  it('should calculate the remaining ammount to pay in the quotation', function(){
    var quotation = {ammountPaid: 100};
    var amount = 40;
    var result = CheckoutPaymentsCtrl.calculateRemaining(amount, quotation);
    expect(result).toBe(amount - quotation.ammountPaid);
  })


});
