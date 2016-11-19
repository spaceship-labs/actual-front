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

function ClientCreateCtrl($location, $rootScope, dialogService, commonService, clientService){
  var vm = this;

  angular.extend(vm, {
    activeTab       : 0,
    client          :{},
    contacts        :[{}],
    fiscalAddress   :{},
    titles: [
      {label:'Sr.', value:'Sr'},
      {label:'Sra.', value: 'Sra'},
      {label: 'Srita.', value: 'Srita'}
    ],
    genders: [
      {label:'Masculino', value: 'M'},
      {label: 'Femenino', value: 'F'}
    ],
    states          : [],
    countries       : commonService.getCountries(),
    addContactForm  : addContactForm,
    create          : create,
    onPikadaySelect : onPikadaySelect
  });

  function onPikadaySelect(pikaday){
    vm.client.Birthdate = pikaday._d;
  }

  function addContactForm(){
    vm.contacts.push({});
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

  function create(){
    vm.isLoading = true;
    vm.client.contacts = vm.contacts.filter(filterContacts);
    vm.client.fiscalAddress = vm.fiscalAddress || false;

    clientService.create(vm.client)
      .then(function(res){
        console.log(res);
        var created = res.data;
        vm.isLoading = false;
        if(created.CardCode){
          if($location.search().continueQuotation){
            $location
              .path('/quotation/edit/' + $rootScope.activeQuotation.id)
              .search({createdClient:true});
          }else{
            $location
              .path('/clients/profile/'+created.id)
              .search({createdClient:true});
          }
        }
      })
      .catch(function(err){
        console.log(err);
        vm.isLoading = false;
        dialogService.showDialog('Hubo un error: ' + (err.data || err) );
      });
  }

  init();

}
