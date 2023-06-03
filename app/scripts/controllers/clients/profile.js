'use strict';
angular.module('actualApp').controller('ClientProfileCtrl', ClientProfileCtrl);

function ClientProfileCtrl(
  $scope,
  $location,
  $routeParams,
  $rootScope,
  $timeout,
  $mdDialog,
  $q,
  commonService,
  clientService,
  quotationService,
  checkoutService,
  orderService,
  dialogService,
  authService
) {
  var vm = this;

  angular.extend(vm, {
    activeTab: 0,
    personalEditEnabled: false,
    titles: clientService.getTitles(),
    genders: clientService.getGenders(),
    states: [],
    countries: commonService.getCountries(),
    fiscalAddressConstraints: clientService.fiscalAddressConstraints,
    columnsLeads: [
      { key: 'folio', label: 'Folio' },
      { key: 'Client.CardName', label: 'Cliente' },
      { key: 'Client.E_Mail', label: 'Email' },
      { key: 'createdAt', label: 'Fecha', date: true },
      { key: 'total', label: 'Total', currency: true },
      { key: 'ammountPaid', label: 'Cobrado', currency: true },
      {
        key: 'Acciones',
        label: 'Acciones',
        propId: 'id',
        actions: [{ url: '/quotations/edit/', type: 'edit' }]
      }
    ],
    columnsOrders: [
      { key: 'folio', label: 'Folio' },
      { key: 'Client.CardName', label: 'Cliente' },
      { key: 'createdAt', label: 'Fecha', date: true },
      { key: 'discount', label: 'Descuento', currency: true },
      { key: 'total', label: 'Total', currency: true },
      { key: 'ammountPaid', label: 'Cobrado', currency: true },
      {
        key: 'Acciones',
        label: 'Acciones',
        propId: 'id',
        actions: [{ url: '/checkout/order/', type: 'edit' }]
      }
    ],
    updateFiscalAddress: updateFiscalAddress,
    createQuotation: createQuotation,
    changeTab: changeTab,
    contactAction: contactAction,
    copyPersonalDataToContact: copyPersonalDataToContact,
    onPikadaySelect: onPikadaySelect,
    updatePersonalData: updatePersonalData,
    apiResourceLeads: quotationService.getByClient,
    apiResourceOrders: orderService.getList,
    updateContact: updateContact,
    createContact: createContact,
    genericRfc : true,
    isGenericRFC : isGenericRFC,
    personalDataAction: personalDataAction,
    isContactEditModeActive: isContactEditModeActive,
    showNewFiscalForm: showNewFiscalForm,
    showNewAddressForm: showNewAddressForm,
    isUserAdminOrManager: authService.isUserAdminOrManager(),

    CFDIUseListLegalPerson : clientService.getCFDIUseListLegalPerson(),
    CFDIUseListNaturalPerson : clientService.getCFDIUseListNaturalPerson(),
    RegimesLegalPerson : clientService.getRegimesLegalPerson(),
    RegimesNaturalPerson : clientService.getRegimesNaturalPerson(),
    getCFDIUseListSelect : getCFDIUseListSelect,
    getRegimesSelect : getRegimesSelect,
    setCompanyName : setCompanyName,
  });

  function init() {
    vm.isLoading = true;

    if ($location.search().createdClient) {
      dialogService.showDialog('Cliente registrado', function() {
        if ($rootScope.activeQuotation && $location.search().checkoutProcess) {
          return $location.path(
            '/quotations/edit/' + $rootScope.activeQuotation.id
          );
        }
        checkoutService.returnToCheckout();
      });
    }

    clientService.getById($routeParams.id).then(function(res) {
      vm.isLoading = false;
      vm.client = res.data;
      vm.client = formatClient(vm.client);

      if ($location.search().activeTab && $location.search().activeTab < 4) {
        vm.activeTab = $location.search().activeTab;
      }

      vm.client = clientService.setClientDefaultData(vm.client);
      console.log("vm.client",vm.client);
      isGenericRFC(vm.client.LicTradNum)

      commonService
        .getStatesSap()
        .then(function(res) {
          console.log(res);
          vm.states = res.data;
        })
        .catch(function(err) {
          console.log(err);
        });
    });
  }

  function copyPersonalDataToContact(client, contact) {
    if (!contact.copyingPersonalData) {
      contact.FirstName = _.clone(client.FirstName);
      contact.LastName = _.clone(client.LastName);
      contact.Tel1 = _.clone(client.Phone1);
      contact.Cellolar = _.clone(client.Cellular);
      contact.E_Mail = _.clone(client.E_Mail);
      contact._email = _.clone(client.E_Mail);
    } else {
      delete contact.FirstName;
      delete contact.LastName;
      delete contact.Tel1;
      delete contact.Cellolar;
      delete contact.E_Mail;
      delete contact._email;
    }
  }

  function showNewFiscalForm() {
    vm.isNewFiscalFormActive = true;
    vm.newFiscalAddress = {
      U_Correos: _.clone(vm.client.E_Mail)
    };
  }

  function showNewAddressForm() {
    vm.isNewAddressFormActive = true;
    vm.newContact = {
      E_Mail: _.clone(vm.client.E_Mail)
    };
  }

  function formatClient(client) {
    client.Birthdate = client.Birthdate ? client.Birthdate : new Date();
    client.FirstName = client.FirstName || _.clone(client.CardName);

    if (client.Contacts) {
      client.Contacts = client.Contacts.map(function(contact) {
        if (!contact.FirstName) {
          contact.FirstName = contact.Name;
        }
        return contact;
      });
    }

    vm.filtersQuotations = { Client: client.id };
    vm.filtersOrders = { Client: client.id };
    return client;
  }

  function changeTab(index) {
    vm.activeTab = index;
    $location.search({ activeTab: index });
  }

  function onPikadaySelect(pikaday) {
    vm.client.Birthdate = pikaday._d;
  }

  function personalDataAction(form) {
    if (vm.personalEditEnabled) {
      updatePersonalData(form);
    } else {
      vm.personalEditEnabled = true;
    }
  }

  function updatePersonalData(form) {
    var isValidEmail = commonService.isValidEmail(vm.client.E_Mail, {
      excludeActualDomains: true
    });

    var fiscalAddress = vm.client.FiscalAddress;
    
    fiscalAddress.LicTradNum = _.clone(vm.client.LicTradNum);
    fiscalAddress.cfdiUse = vm.client.cfdiUse;
    fiscalAddress.regime = vm.client.regime;
    fiscalAddress.companyName = vm.client.FirstName + ' ' + vm.client.LastName;

    var fiscalAddressForm = [
      {
        form: vm.fiscalForm,
        data: fiscalAddress,
      },
    ];

    var filledForm = getFilledForms(fiscalAddressForm);
    var validateFormsResult = validateForms(filledForm);
    var areFormsValid = validateFormsResult.valid;
    console.log('fiscalAddressForm', fiscalAddressForm);
    
    if(!areFormsValid){
      dialogService.showDialog("Error en formulario fiscal");
    }else{
      updateFiscalAddress(filledForm[0]);

      if (form.$valid && isValidEmail) {
        vm.isLoading = true;
        var params = _.clone(vm.client);
        delete params.FiscalAddress;
        delete params.Contacts;
        console.log('params', params);
        clientService
          .update(vm.client.CardCode, params)
          .then(function(res) {
            console.log(res);
            vm.isLoading = false;
            dialogService.showDialog(
              'Datos personales actualizados',
              checkoutService.returnToCheckout
            );
          })
          .catch(function(err) {
            console.log('err', err);
            var error = err.data || err;
            error = error ? error.toString() : '';
            dialogService.showDialog('Hubo un error: ' + error);
            vm.isLoading = false;
          });
      } else if (!isValidEmail) {
        vm.isLoading = false;
        dialogService.showDialog('Email no valido');
      } else {
        vm.isLoading = false;
        dialogService.showDialog('Campos incompletos');
      }
    }

    vm.personalEditEnabled = false;

  }

  function createQuotation() {
    var params = { Client: vm.client.id };
    vm.isLoading = true;
    quotationService.newQuotation(params);
  }

  function contactAction(form, contact) {
    if (contact.editEnabled) {
      updateContact(form, contact);
    } else {
      contact.editEnabled = true;
    }
  }

  function updateContact(form, contact) {
    var isValidEmail = commonService.isValidEmail(contact.E_Mail, {
      excludeActualDomains: true
    });
    if (form.$valid && isValidEmail) {
      contact.isLoading = true;
      var params = _.clone(contact);
      delete params.formWrapper;
      delete params.isLoading;
      clientService
        .updateContact(contact.CntctCode, vm.client.CardCode, params)
        .then(function(res) {
          console.log(res);
          contact.isLoading = false;
          contact.editEnabled = false;
          dialogService.showDialog(
            'Dirección de entrega actualizada',
            checkoutService.returnToCheckout
          );
        })
        .catch(function(err) {
          console.log(err);
          var error = err.data || err;
          error = error ? error.toString() : '';
          dialogService.showDialog('Hubo un error: ' + error);
          contact.isLoading = false;
        });
    } else if (!isValidEmail) {
      vm.isLoading = false;
      dialogService.showDialog('Email no valido');
    } else {
      vm.isLoading = false;
      dialogService.showDialog('Campos incompletos');
    }
  }

  function createContact(form) {
    vm.isLoading = true;
    var isValidEmail = commonService.isValidEmail(vm.newContact.E_Mail, {
      excludeActualDomains: true
    });
    if (form.$valid && isValidEmail) {
      console.log(vm.newContact);
      clientService
        .createContact(vm.client.CardCode, vm.newContact)
        .then(function(res) {
          console.log(res);
          vm.isLoading = false;
          vm.showNewContact = false;
          vm.isNewAddressFormActive = false;
          vm.newContact = {};
          var created = res.data;
          vm.client.Contacts.push(created);
          //dialogService.showDialog('Dirección creada');
          dialogService.showDialog(
            'Dirección creada',
            checkoutService.returnToCheckout
          );
        })
        .catch(function(err) {
          vm.isLoading = false;
          console.log(err);
          var error = err.data || err;
          error = error ? error.toString() : '';
          dialogService.showDialog('Hubo un error: ' + error);
        });
    } else if (!isValidEmail) {
      vm.isLoading = false;
      dialogService.showDialog('Email no valido');
    } else {
      vm.isLoading = false;
      dialogService.showDialog('Campos incompletos');
    }
  }

  function isContactEditModeActive() {
    if (vm.client && vm.client.Contacts) {
      if (_.findWhere(vm.client.Contacts, { editEnabled: true })) {
        return true;
      }
    }
    return false;
  }

  function updateFiscalAddress(form) {
    vm.isLoading = true;
    var isValidEmail = commonService.isValidEmail(
      vm.client.FiscalAddress.U_Correos,
      { excludeActualDomains: true }
    );
    if (form.$valid && isValidEmail) {
      var params = _.clone(vm.client.FiscalAddress);
      params.LicTradNum = _.clone(vm.client.LicTradNum);
      params.cfdiUse = vm.client.cfdiUse;
      params.regime = vm.client.regime;

      clientService
        .updateFiscalAddress(params.id, vm.client.CardCode, params)
        .then(function(results) {
          vm.isLoading = false;
          dialogService.showDialog(
            'Datos guardados',
            checkoutService.returnToCheckout
          );
        })
        .catch(function(err) {
          vm.isLoading = false;
          console.log(err);
          dialogService.showDialog(
            'Hubo un error al guardar datos de facturación: ' +
              (err.data || err)
          );
        });
    } else if (!isValidEmail) {
      vm.isLoading = false;
      dialogService.showDialog('Email no valido');
    } else {
      vm.isLoading = false;
      dialogService.showDialog('Campos incompletos');
    }
  }

  function getCFDIUseListSelect (rfc) {
    var LicTradNum = rfc;
    if ( LicTradNum ) {
      if ( LicTradNum.length == 12 ) {
        return vm.CFDIUseListLegalPerson;
      }else if ( LicTradNum.length == 13) {
        return vm.CFDIUseListNaturalPerson;
      }
    }
  }

  function getRegimesSelect (rfc) {
    var LicTradNum = rfc;
    if ( LicTradNum ) {
      if ( LicTradNum.length == 12 ) {
        return vm.RegimesLegalPerson;
      }else if ( LicTradNum.length == 13) {
        return vm.RegimesNaturalPerson;
      }
    }
  }

  function isGenericRFC ( rfc ){
    if(rfc == clientService.GENERIC_RFC){
      vm.genericRfc = true;
      vm.client.regime = "SIMPLIFIED_REGIME";
      vm.client.cfdiUse = "S01";
      vm.client.FiscalAddress.ZipCode = "77507";

      return true;
    }else{
      vm.genericRfc = false;
      return false;
    }
  }

  function setCompanyName ( firstName, lastName ){
    if ( firstName == undefined || firstName == null){
      firstName = "";
    }
    if ( lastName == undefined || lastName == null ){
      lastName = "";
    }
    vm.fiscalAddress.companyName = firstName + " " + lastName;
  }

  function validateForms(forms) {
    if (forms.length > 0) {
      var validFlag = true;
      var errorTabs = [];

      for (var i = 0; i < forms.length; i++) {
        if (!forms[i].$valid) {
          validFlag = false;
          errorTabs = errorTabs.concat(forms[i].tab);
        }
      }
      return {
        valid: validFlag,
        errorTabs: errorTabs
      };
    }
    return {
      valid: true
    };
  }

  function getFilledForms(formsRelations) {
    var filledForms = formsRelations.reduce(function(acum, formRelation) {
      //Validation for fiscal form

      if (!_.isEmpty(formRelation.data) || formRelation.isRequired) {
        acum.push(formRelation.form);
      }
      return acum;
    }, []);

    return filledForms;
  }

  init();
}
