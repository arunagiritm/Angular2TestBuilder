define(['../module'], function(controllerModule) {
    'use strict';
    controllerModule.factory("commonService", ['$http', '$q',

    function($http, $q) {
       


        return thatCommonService = {


            getControllerDetails: function(fileObj) {
                var defferred = $q.defer();
               
                $http.post("/getDependencies", {
                    fileObj: fileObj
                }).then(
                    function(response) {
                       
                       
                        defferred.resolve(response.data);

                    },
                    function(response) {
                        defferred.reject(response);

                    });
                return defferred.promise;
            },

            getAngularMethods: function(fileObj, depServices) {

               
                var injector = angular.injector(["ng", "ngMock", "he"]);

               

                var je = {};
                je.values = "";
                var reqObj;
                var filename = fileObj.filename.replace('.js', '');


               
                var depObj = {};
                var depname = ""
                var depvalue = "";

               
                var scope = injector.get('$rootScope').$new();
                var controller = injector.get('$controller');

               
                for (service in depServices) {
                    depname = depServices[service];
                    if (depname.substring(0, 2) != "d_" &&
                        depname != "$scope") {
                        depValue = injector.get(depname);
                    } else {
                        if (depname == "$scope") {
                            depValue = scope;
                        } else {
                            depValue = je.values;
                        }
                       
                    }
                    depObj[depname] = depValue;

                }

                var getClaimInfoFaked = function() {
                    return {
                        getClaimsInfo: function() {

                            return depObj['claimInfoFactory'].initClaimInformation(reqObj || {});
                        }
                    }
                }

                scope.getClaimInfo = getClaimInfoFaked;

               
               
                var ctrlReference = controller(filename, depObj);
               
               
               
                var allMethods = [];
                var conMethods = [];
                if (ctrlReference) {
                    allMethods = thatCommonService.getAllMethods(scope);
                   
                    if (conMethods.length > 0) {
                       
                        allMethods.join(conMethods);
                    }
                }
                return allMethods;



            },

            getAllMethods: function(obj) {
                var allmethods = [];
               
                var props = Object.getOwnPropertyNames(obj);
                var methods = props.filter(function(property) {
                    if (typeof obj[property] == 'function') {
                        var allMethod = {};
                        allMethod["functionName"] = property;
                        allMethod["args"] = thatCommonService.getFunctionArguments(obj[property]);
                        allmethods.push(allMethod);
                        return true;
                    }
                    return false;

                });
               
                return allmethods;
            },
            getFunctionArguments: function(func) {
               
                var args = func.toString().match(/function\s.*?\(([^)]*)\)/)
 });