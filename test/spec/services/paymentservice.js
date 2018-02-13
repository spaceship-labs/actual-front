'use strict';

describe('Service: paymentService', function () {

  // load the service's module
  beforeEach(module('actualApp'));

  // instantiate service
  var paymentService;
  beforeEach(inject(function (_paymentService_) {
    paymentService = _paymentService_;
  }));

  it('should get the MXN amount from a usd payment', function () {
    var payment = {ammount: 10, exchangeRate: 18.50};
    var amountMXN = paymentService.getAmountMXN(payment.ammount, payment.exchangeRate);
    var expected = payment.ammount * payment.exchangeRate;
    expect(amountMXN).toBe(expected)
  });

  it('should get an array of payment options for credit card payment method', function(){
    var method = {type:'credit-card', storeType: 'studio'};
    var options = paymentService.getPaymentOptionsByMethod(method);
    expect(options).toBeDefined();
    expect(options.length).toBeGreaterThan(0)
  });

  it('should get the payment type string for debit card', function(){
    var payment = {type: 'debit-card'};
    var typeString = paymentService.getPaymentTypeString(payment);
    expect(typeString).toBe('1 sola exhibición');
  });

  it('should get balance for client balance payment method', function(){
    var quotation = {
      Client: {
        Balance: 100,
        ewallet: 50
      }
    };
    var method = {type: 'client-balance'};
    var balance = paymentService.getMethodAvailableBalance(method, quotation);
    expect(balance).toBe(quotation.Client.Balance);
  });

  it('should get balance for ewallet payment method', function(){
    var quotation = {
      Client: {
        Balance: 100,
        ewallet: 50
      }
    };
    var method = {type: 'ewallet'};
    var balance = paymentService.getMethodAvailableBalance(method, quotation);
    expect(balance).toBe(quotation.Client.ewallet);
  });

  it('should get the client balance description string', function(){
    var balance = 100;
    var description = paymentService.getClientBalanceDescription(balance);
    expect(description).toMatch(/Saldo disponible/)
    expect(description).toMatch(/100/)
  });

  it('should get return true when payment has a debit or credit card type', function(){
    var payment = {type: 'debit-card'};
    var result = paymentService.isCardCreditOrDebitPayment(payment);
    expect(result).toBe(true);

    var payment2 = {type: 'credit-card'};
    var result2 = paymentService.isCardCreditOrDebitPayment(payment2);
    expect(result2).toBe(true);

  });


});
