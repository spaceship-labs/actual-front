"use strict";
angular
  .module("actualApp")
  .controller("CheckoutPaymentsCtrl", CheckoutPaymentsCtrl);

function CheckoutPaymentsCtrl(
  $routeParams,
  $scope,
  $q,
  $mdMedia,
  $mdDialog,
  $location,
  $filter,
  commonService,
  dialogService,
  formatService,
  orderService,
  quotationService,
  authService,
  paymentService,
  ewalletService,
  checkoutService,
  clientService,
  $interval,
  api,
  activeStore
) {
  var vm = this;

  angular.extend(vm, {
    api: api,
    applyTransaction: applyTransaction,
    areMethodsDisabled: checkoutService.areMethodsDisabled,
    calculateRemaining: calculateRemaining,
    createOrder: createOrder,
    chooseMethod: chooseMethod,
    getPaidPercentage: checkoutService.getPaidPercentage,
    isActiveGroup: checkoutService.isActivePaymentGroup,
    isActiveMethod: checkoutService.isActiveMethod,
    isMinimumPaid: checkoutService.isMinimumPaid,
    isValidQuotationAddress: isValidQuotationAddress,
    isPaymentModeActive: isPaymentModeActive,
    intervalProgress: false,
    customFullscreen: $mdMedia("xs") || $mdMedia("sm"),
    singlePayment: true,
    multiplePayment: false,
    isLoading: true,
    loadingEstimate: 0,
    payments: [],
    sapLogs: [],
    paymentMethodsGroups: [],
    CLIENT_BALANCE_TYPE: paymentService.types.CLIENT_BALANCE,
    roundCurrency: commonService.roundCurrency
  });

  var EWALLET_TYPE = ewalletService.ewalletType;
  var CLIENT_BALANCE_TYPE = vm.CLIENT_BALANCE_TYPE;

  init();

  function init() {
    animateProgress();
    vm.isLoading = true;

    var forceLatestData = true;
    var getParams = {
      payments: true,
      forceLatestData: forceLatestData
    };

    quotationService
      .getById($routeParams.id, getParams)
      .then(function(res) {
        vm.quotation = res.data;
        loadSapLogs(vm.quotation.id);

        return $q.all([
          quotationService.validateQuotationStockById(vm.quotation.id),
          loadPaymentMethods()
        ]);
      })
      .then(function(result) {
        var isValidStock = result[0];

        if (!isValidStock) {
          console.log("Out of stock");
          $location
            .path("/quotations/edit/" + vm.quotation.id)
            .search({ stockAlert: true });
        }

        if (!vm.quotation.Details || vm.quotation.Details.length === 0) {
          $location.path("/quotations/edit/" + vm.quotation.id);
        }

        if (!isValidQuotationAddress(vm.quotation)) {
          console.log("No address");
          $location
            .path("/quotations/edit/" + vm.quotation.id)
            .search({ missingAddress: true });
        }

        if (vm.quotation.Order) {
          $location.path("/checkout/order/" + vm.quotation.Order.id);
        }

        if (!clientService.validateRfc(vm.quotation.Client.LicTradNum)) {
          console.log("invalid rfc");
          $location.path("/checkout/client/" + vm.quotation.id);
          return;
        }

        vm.quotation.ammountPaid = vm.quotation.ammountPaid || 0;

        vm.isLoading = false;
      })
      .catch(function(err) {
        console.log("err", err);
        dialogService.showDialog("Error: \n" + err.data);
      });
  }

  function loadSapLogs(quotationId) {
    vm.isLoadingSapLogs = true;
    quotationService
      .getSapOrderConnectionLogs(quotationId)
      .then(function(res) {
        vm.sapLogs = res.data;
        vm.isLoadingSapLogs = false;
      })
      .catch(function(err) {
        console.log("err", err);
        vm.isLoadingSapLogs = false;
      });
  }

  function isValidQuotationAddress(quotation) {
    if (quotation.immediateDelivery || quotation.Address) {
      return true;
    }
    return false;
  }

  function loadPaymentMethods() {
    var deferred = $q.defer();
    var params = {
      financingTotals: true
    };
    quotationService
      .getPaymentOptions(vm.quotation.id, params)
      .then(function(response) {
        var groups = response.data || [];
        vm.paymentMethodsGroups = groups;

        //ewalletService.updateQuotationEwalletBalance(vm.quotation, vm.paymentMethodsGroups);
        paymentService.updateQuotationClientBalance(
          vm.quotation,
          vm.paymentMethodsGroups
        );

        if (vm.quotation.Payments && vm.quotation.Payments.length > 0) {
          vm.quotation = setQuotationTotalsByGroup(vm.quotation);
        }
        deferred.resolve();
      })
      .catch(function(err) {
        console.log("err", err);
        deferred.reject(err);
      });

    return deferred.promise;
  }

  function setMethod(method, group) {
    method.storeType = activeStore.group;
    method.storeCode = activeStore.code;
    //var options = paymentService.getPaymentOptionsByMethod(method);
    //method.options = options;
    method.group = _.clone(group);
    vm.quotation.total = _.clone(method.total);
    vm.quotation.subtotal = _.clone(method.subtotal);
    vm.quotation.discount = _.clone(method.discount);
    return method;
  }

  function chooseMethod(method, group) {
    vm.activeMethod = setMethod(method, group);
    var remaining = vm.quotation.total - vm.quotation.ammountPaid;
    vm.activeMethod.remaining = remaining;
    vm.activeMethod.maxAmmount = remaining;

    if (method.type === EWALLET_TYPE || method.type === CLIENT_BALANCE_TYPE) {
      var balance = paymentService.getMethodAvailableBalance(
        method,
        vm.quotation
      );
      vm.activeMethod.maxAmmount = balance;
      if (balance <= remaining) {
        remaining = balance;
      }
    }

    if (
      vm.activeMethod.maxAmmount < 0.01 &&
      (method.type === CLIENT_BALANCE_TYPE || method.type === EWALLET_TYPE)
    ) {
      dialogService.showDialog("Fondos insuficientes");
      return false;
    }

    if (vm.quotation.Client) {
      if (
        vm.activeMethod.currency === "usd" &&
        vm.quotation.Client.Currency === "MXP"
      ) {
        dialogService.showDialog(
          "Pagos en dolares no disponibles para este cliente por configuración en SAP"
        );
        return false;
      }
    }

    return vm.applyTransaction(null, vm.activeMethod, remaining);
  }

  function clearActiveMethod() {
    vm.activeMethod = null;
    var firstMethod = false;
    var group = false;

    if (!vm.quotation.Payments || vm.quotation.Payments.length === 0) {
      group = vm.paymentMethodsGroups[0];
      firstMethod = group.methods[0];
    } else {
      var groupIndex = checkoutService.getGroupByQuotation(vm.quotation) - 1;
      group = vm.paymentMethodsGroups[groupIndex];
      firstMethod = group.methods[0];
    }
    setMethod(firstMethod, group);
  }

  function setQuotationTotalsByGroup(quotation) {
    var paymentGroup = checkoutService.getGroupByQuotation(quotation);
    var currentGroup = _.findWhere(vm.paymentMethodsGroups, {
      group: paymentGroup
    });
    var firstMethod = currentGroup.methods[0];
    quotation.paymentGroup = paymentGroup;
    quotation.total = _.clone(firstMethod.total);
    quotation.subtotal = _.clone(firstMethod.subtotal);
    quotation.discount = _.clone(firstMethod.discount);
    return quotation;
  }

  function updateVMQuoatation(newQuotation) {
    vm.quotation.ammountPaid = newQuotation.ammountPaid;
    vm.quotation.paymentGroup = newQuotation.paymentGroup;
    vm.quotation = setQuotationTotalsByGroup(vm.quotation);
    delete vm.activeMethod;
  }

  function loadPayments() {
    quotationService
      .getPayments(vm.quotation.id)
      .then(function(res) {
        var payments = res.data;
        vm.quotation.Payments = payments;
        vm.isLoadingPayments = false;
      })
      .catch(function(err) {
        console.log("err", err);
        dialogService.showDialog("Hubo un error, recarga la página");
        vm.isLoadingPayments = false;
      });
  }

  function isPaymentModeActive(payment, quotation) {
    return (
      (payment.ammount > 0 && quotation.ammountPaid < quotation.total) ||
      payment.ammount < 0
    );
  }

  function addPayment(payment) {
    if (isPaymentModeActive(payment, vm.quotation)) {
      vm.isLoadingPayments = true;
      vm.isLoading = true;
      paymentService
        .addPayment(vm.quotation.id, payment)
        .then(function(res) {
          if (res.data) {
            var updatedQuotation = res.data;
            vm.quotation.Payments.push(payment);
            updateVMQuoatation(updatedQuotation);
            loadPayments();
            return loadPaymentMethods();
          } else {
            return $q.reject("Hubo un error");
          }
        })
        .then(function() {
          vm.isLoading = false;
          delete vm.activeMethod;
          if (vm.quotation.ammountPaid >= vm.quotation.total) {
            createOrder();
          } else {
            dialogService.showDialog("Pago aplicado");
          }

          if (payment.type === EWALLET_TYPE) {
            //ewalletService.updateQuotationEwalletBalance(vm.quotation, vm.paymentMethodsGroups);
          }

          if (payment.type === CLIENT_BALANCE_TYPE) {
            paymentService.updateQuotationClientBalance(
              vm.quotation,
              vm.paymentMethodsGroups
            );
          }
        })
        .catch(function(err) {
          console.log(err);
          authService.showUnauthorizedDialogIfNeeded(err);

          vm.isLoadingPayments = false;
          vm.isLoading = false;
          var error = err.data || err;
          error = error ? error.toString() : "";
          dialogService.showDialog("Hubo un error: " + error);
          //
          //dialogService.showDialog('Error: \n' + (err.data || err) );
        });
    } else {
      createOrder();
      //dialogService.showDialog('Cantidad total pagada');
    }
  }

  function applyTransaction(ev, method, ammount) {
    if (method) {
      var templateUrl = "views/checkout/payment-cash-dialog.html";
      method.currency = method.currency || "MXP";
      method.ammount = ammount;
      var paymentOpts = _.clone(method);
      var controller = DepositController;
      if (method.terminals) {
        templateUrl = "views/checkout/payment-dialog.html";
        controller = TerminalController;
      }
      paymentOpts.ammount = ammount;
      var useFullScreen =
        ($mdMedia("sm") || $mdMedia("xs")) && vm.customFullscreen;
      $mdDialog
        .show({
          controller: [
            "$scope",
            "$mdDialog",
            "$filter",
            "formatService",
            "commonService",
            "ewalletService",
            "dialogService",
            "paymentService",
            "payment",
            controller
          ],
          templateUrl: templateUrl,
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          fullscreen: useFullScreen,
          locals: {
            payment: paymentOpts
          }
        })
        .then(
          function(payment) {
            addPayment(payment);
          },
          function() {
            clearActiveMethod();
          }
        );
    } else {
      commonService.showDialog("Revisa los datos, e intenta de nuevo");
    }
  }

  function calculateRemaining(ammount, quotation) {
    return ammount - quotation.ammountPaid;
  }

  function createOrder() {
    if (!vm.quotation.Details || vm.quotation.Details.length === 0) {
      dialogService.showDialog("No hay artículos en esta cotización");
      return;
    }

    if (checkoutService.isMinimumPaid(vm.quotation)) {
      vm.isLoadingProgress = true;
      vm.loadingEstimate = 0;
      var params = {
        paymentGroup: vm.quotation.paymentGroup || 1
      };
      animateProgress();
      orderService
        .createFromQuotation(vm.quotation.id, params)
        .then(function(res) {
          vm.isLoadingProgress = false;
          vm.order = res.data;
          if (vm.order.id) {
            quotationService.removeCurrentQuotation();
            $location
              .path("/checkout/order/" + vm.order.id)
              .search({ orderCreated: true });
          }
        })
        .catch(function(err) {
          console.log("err", err);
          var errMsg = "";
          if (err) {
            errMsg = err.data || err;
            errMsg = errMsg ? errMsg.toString() : "";
            dialogService.showDialog(
              "Hubo un error, recarga la página \n" + errMsg
            );
          }
          loadSapLogs(vm.quotation.id);
          vm.isLoadingProgress = false;
        });
    }
  }

  function animateProgress() {
    vm.intervalProgress = $interval(function() {
      vm.loadingEstimate += 5;
      if (vm.loadingEstimate >= 100) {
        vm.loadingEstimate = 0;
      }
    }, 1000);
  }

  $scope.$on("$destroy", function() {
    $mdDialog.cancel();
    if (vm.intervalProgress) {
      $interval.cancel(vm.intervalProgress);
    }
  });
}
