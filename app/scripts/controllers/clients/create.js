'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:ClientCreateCtrl
 * @description
 * # ClientCreateCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('ClientCreateCtrl', ClientCreateCtrl);

function ClientCreateCtrl(
    $scope,
    $location, 
    $rootScope, 
    dialogService, 
    commonService, 
    clientService,
    quotationService,
    checkoutService,
    localStorageService,
    $interval
  ){
  var vm = this;
  var PERSONAL_DATA_TAB = 0;
  var FISCAL_DATA_TAB = 1;
  var DELIVERY_DATA_TAB = 3;

  angular.extend(vm, {
    activeTab       : 0,
    client          :{},
    contacts        :[{}],
    fiscalAddress   :{},
    loadingEstimate :0,
    isLoadingProgress: false,
    intervalProgress: false,
    titles          : clientService.getTitles(),
    genders         : clientService.getGenders(),
    states          : [],
    countries       : commonService.getCountries(),
    addContactForm  : addContactForm,
    create          : create,
    onPikadaySelect : onPikadaySelect,
    removeContactForm: removeContactForm,
    clearTabFields  : clearTabFields,
    PERSONAL_DATA_TAB: 0,
    FISCAL_DATA_TAB: 1,
    DELIVERY_DATA_TAB: 3
  });

  function onPikadaySelect(pikaday){
    vm.client.Birthdate = pikaday._d;
  }

  function clearPersonalDataTab(){
    vm.client = {};
    vm.pikadayDate.setDate(null);
  }

  function clearFiscalAddressTab(){
    vm.fiscalAddress = {};
    vm.client.LicTradNum = null;
  }

  function clearContactsTab(){
    vm.contacts = [{}];
  }

  function clearTabFields(){
    switch(vm.activeTab){
      case vm.PERSONAL_DATA_TAB:
        clearPersonalDataTab();
        break;
      case vm.FISCAL_DATA_TAB:
        clearFiscalAddressTab();
        break;
      case DELIVERY_DATA_TAB:
        clearContactsTab();
    }
  }

  function addContactForm(){
    vm.contacts.push({});
  }

  function removeContactForm(contactFormIndex){
    if(vm.contacts){
      vm.contacts.splice(contactFormIndex, 1);
    }
  }

  function addContact(form){
    if(form.$valid){
      vm.contacts.push({});
    }else{
      dialogService.showDialog('Campos incompletos');
    }
  }

  function init(){
    commonService.getStatesSap().then(function(res){
      vm.states = res.data;
    })
    .catch(function(err){
      console.log(err);
    });
  }


  function filterContacts(contact){
    return !_.isUndefined(contact.FirstName);
  }

  function validateClientEmails(client){
    if(client.contacts && client.contacts.length > 0){
      for(var i=0;i<client.contacts.length;i++){
        if(
          !commonService.isValidEmail(client.contacts[i].E_Mail, {excludeActualDomains: true}) && 
          !_.isEmpty(client.fiscalAddress)
        ){
          return false;
        }
      }
    }

    if(client.fiscalAddress && !_.isEmpty(client.fiscalAddress) ){
      if(!commonService.isValidEmail(client.fiscalAddress.U_Correos, {excludeActualDomains: true})){
        return false;
      }
    }

    if(!commonService.isValidEmail(client.E_Mail, {excludeActualDomains: true})){
      return false;
    }

    return true;
  }


  function getFilledForms(formsRelations){
    var filledForms = formsRelations.reduce(function(acum, formRelation){
      if( angular.isArray(formRelation.data) ){
        var areFilled = false;
        for(var i = 0; i<formRelation.data.length; i++){
          if( !_.isEmpty(formRelation.data[i]) ){
            areFilled = true;
          }
        }
        if(areFilled){
          console.log('pushing array form');
          acum.push(formRelation.form);
        }
      }
      else if( !_.isEmpty(formRelation.data) ){
        console.log('pushing normal form');
        acum.push(formRelation.form);
      }
      return acum;
    },[]);
    return filledForms;
  }

  function areFormsValid(forms){
    if(forms.length > 0){
      var validFlag = true;
      for(var i=0;i<forms.length;i++){
        if(!forms[i].$valid){
          validFlag = false;
        }
      }
      return validFlag;
    }
    return true;
  }

  function create(createPersonalForm, createFiscalForm, createDeliveryForm){
    vm.isLoadingProgress = true;
    vm.loadingEstimate = 0;    
    animateProgress();

    vm.client.contacts = vm.contacts.filter(filterContacts);
    vm.client.fiscalAddress = vm.fiscalAddress || false;
    var formsRelations = [
      {form: createFiscalForm, data: vm.client.fiscalAddress},
      {form: createDeliveryForm, data: vm.client.contacts}      
    ];
    var areValidEmails = validateClientEmails(vm.client);
    var filledForms = getFilledForms(formsRelations);
    if(areFormsValid(filledForms) && createPersonalForm.$valid && areValidEmails){
      clientService.create(vm.client)
        .then(function(res){
          console.log(res);
          var created = res.data;
          vm.isLoadingProgress = false;
          cancelProgressInterval();
          if(created.CardCode){
            //var isInCheckoutProcess = localStorageService.get('inCheckoutProcess');
            if($location.search().continueQuotation || $location.search().checkoutProcess){
              assignClientToQuotation(created.id);
            }
            else{
              $location
                .path('/clients/profile/'+created.id)
                .search({createdClient:true});
            }
          }
        })
        .catch(function(err){
          console.log(err);
          vm.isLoadingProgress = false;
          cancelProgressInterval();
          dialogService.showDialog('Hubo un error: ' + (err.data || err) );
        });
    }
    else if(!areValidEmails){
      vm.isLoadingProgress = false;
      cancelProgressInterval();
      dialogService.showDialog('Emails no validos');
    }else{
      vm.isLoadingProgress = false;
      cancelProgressInterval();
      dialogService.showDialog('Datos incompletos');
    }

  }

  function cancelProgressInterval(){
    if(vm.intervalProgress){
      $interval.cancel(vm.intervalProgress);
    }    
  }

  function animateProgress(){
    vm.loadingEstimate = 0;
    vm.intervalProgress = $interval(function(){
      vm.loadingEstimate += 5;
      if(vm.loadingEstimate >= 100){
        vm.loadingEstimate = 0;
      }
    },1000);
  }

  function assignClientToQuotation(clientId){
    var params = {Client: clientId};
    var activeQuotation = $rootScope.activeQuotation;
    if(activeQuotation.id){
      quotationService.update(activeQuotation.id, params)
      .then(function(res){
        var quotation = res.data;
        if(quotation && quotation.id){
          quotationService.setActiveQuotation(activeQuotation.id);
          localStorageService.remove('inCheckoutProcess');
          
          if($location.search().checkoutProcess){
            $location
              .path('/clients/profile/'+clientId)
              .search({
                createdClient:true,
                checkoutProcess: $location.search().checkoutProcess
              });            
          }

          else{
            $location
            .path('/quotation/edit/' + activeQuotation.id)
            .search({createdClient:true});        
          }
        }
      })
      .catch(function(err){
        console.log('err', err);
      });
    }
  }


  $scope.$on('$destroy', function(){
    cancelProgressInterval();
  });  

  init();

}
