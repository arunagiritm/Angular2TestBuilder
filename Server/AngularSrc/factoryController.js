define(['../module'], function(controllerModule) {
    'use strict';
    controllerModule.controller("factoryController",function($scope,$http,$location){
   
    $scope.uploadme="";
    $scope.txtfile="";
    $scope.treenew={};
    
    
    var mf={};
    
    
    $scope.readFile=function(){
        $scope.txtfile="";
        angular.element('#fileJson').click();
        clearMe();
        angular.element(".progress-bar").css("width","0%");
        angular.element("#genFile").css("visibility","hidden");
    }
        
        
    $scope.readText= function(filePath) {
		var reader=new FileReader();;
        var output = ""; 
        if(filePath.files && filePath.files[0]) {           
            reader.onload = function (e) {
                output = e.target.result;
                populate(output);
            };
            reader.readAsText(filePath.files[0]);
        }
   
        else { 
            return false;
        }       
        return true;
    }
    	
	$scope.populate=function() {
        if($scope.uploadme){
            txt=$scope.uploadme;
            clearMe();
            var treenew = new tree();
             txt =JSON.stringify( treenew.CreateTree(txt));
            angular.element('#data').jstree({
            "plugins" : ["checkbox"],
            'core' : {
                'data' : JSON.parse(txt)
            }
        });
        treenew.jstree= angular.element('#data').jstree();
         $scope.treenew=treenew;
        }
    
}
$scope.createFactories=function(){
    angular.element(".progress-bar").css("width","0%");
    angular.element("#genFile").css("visibility","hidden");
    if(!$scope.treenew.GenerateHierachyTable){
        alert("Please Create Tree before creating angular factories");
        return;
    }
    $scope.treenew.GenerateHierachyTable();
    
    if($scope.treenew.DataTable.length==0){
        alert("Please make selection in the treenode ");
        return;
    }
    mf=new ModelFactory($scope.treenew.DataTable);
    mf.ReadLocalFile("/Template/FactoryTemplate.txt",mf);
    mf.GenerateFactories();
    
    $http.get("/DelFolder").success(function(response){
        });
    var cntIncr= 100/mf.jsonFactory.length;
    for(var i=0;i< mf.jsonFactory.length;i++ ){
        var pbar=(i+1)*cntIncr;
        $http.post("/CreateFactory",{jsonFactory:mf.jsonFactory[i]}).success(function(response){
            
        });
        if(pbar >100){
            pbar=100;
        }
        angular.element(".progress-bar").css("width", pbar.toString()+"%");
        angular.element(".progress-bar").html(pbar.toString()+"%");
    }
      $http.get("/CreateZip").success(function(response){
           angular.element("#genFile").css("visibility","visible");
        });
    alert("Factories created. Click the generated link to download.")

}

    $scope.close=function(){
        
        
        window.top.close();
    }
    function clearMe(){
		var divEl ='<div id="data" class="demo" ></div>';
		angular.element('#data').remove();
		angular.element('#populate').before(divEl)
		
		
	};
		

})
 });