var app = angular.module("testBuilder");

app.factory("commonService", ['$http', '$q',

    function($http, $q) {
        //global variable to hold methods and arguements.


        return thatCommonService = {


            getControllerDetails: function(fileObj) {
                var defferred = $q.defer();
                //Get the angular dependency services
                $http.post("/getDependencies", {
                    fileObj: fileObj
                }).then(
                    function(response) {
                        //console.log(response);
                        //allmethods = thatCommonService.getAngularMethods(fileObj, response);
                        defferred.resolve(response.data);

                    },
                    function(response) {
                        defferred.reject(response);

                    });
                return defferred.promise;
            },
            createAngular2Specs: function(fileObj){
                 var defferred = $q.defer();
                //Get the angular dependency services
                $http.post("/getangular2Specs", {
                    fileObj: fileObj
                }).then(
                    function(response) {
                        //console.log(response);
                        //allmethods = thatCommonService.getAngularMethods(fileObj, response);
                        defferred.resolve(response.data);

                    },
                    function(response) {
                        defferred.reject(response);

                    });
                return defferred.promise;
            },

            getAngularMethods: function(fileObj, depServices) {

                //Get reference for injector
                var injector = angular.injector(["ng", "ngMock", "he"]);

                //create dummy value for route resolve service

                var je = {};
                je.values = "";
                var reqObj;
                var filename = fileObj.filename.replace('.js', '');


                //create dependency key value object
                var depObj = {};
                var depname = ""
                var depvalue = "";

                //Get reference for rootscope and controller
                var scope = injector.get('$rootScope').$new();
                var controller = injector.get('$controller');

                //Loop through the dep services and create dependency Object values, to be used as parameters
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
                        //depObj[depname] = depValue;
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

                //var dentalBasicClaimController=controller('dentalBasicClaimController',depObj);
                // try{
                var ctrlReference = controller(filename, depObj);
                // } catch {
                //     var ctrlReference =getScopeMethods(filename);
                // }
                var allMethods = [];
                var conMethods = [];
                if (ctrlReference) {
                    allMethods = thatCommonService.getAllMethods(scope);
                    //conMethods=thatCommonService.getArgs(filename+'.constructor');
                    if (conMethods.length > 0) {
                        //concat constructor methods along with scope methods.
                        allMethods.join(conMethods);
                    }
                }
                return allMethods;



            },

            getAllMethods: function(obj) {
                var allmethods = [];
                // var allMethod={};
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
                //console.log(methods);
                return allmethods;
            },
            getFunctionArguments: function(func) {
                // First match everything inside the function argument parens.
                var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

                // Split the arguments string into an array comma delimited.
                return args.split(',').map(function(arg) {
                    // Ensure no inline comments are parsed and trim the whitespace.
                    return arg.replace(/\/\*.*\*\//, '').trim();
                }).filter(function(arg) {
                    // Ensure no undefined values are added.
                    return arg;
                });
            },
            getScopeMethods: function(filename) {

            }

        }


    }

]);