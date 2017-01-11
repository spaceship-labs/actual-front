function StockDialogController($scope, $mdDialog, $location, detailGroup){
  
  $scope.cancel = function(){
    $mdDialog.cancel();
  };

  $scope.delete = function(){
    $mdDialog.hide();
    quotationService.setActiveQuotation(vm.quotation.id);        
    removeDetailsGroup(detailGroup);
  };

  $scope.modify = function(){
    $mdDialog.hide();   
    var itemCode = angular.copy(detailGroup.Product.ItemCode);  
    quotationService.setActiveQuotation(vm.quotation.id);
    removeDetailsGroup(detailGroup)
      .then(function(){
        $location.path('/product/' + itemCode);
      })
      .catch(function(err){
        console.log('err',err);
      });
  };
}