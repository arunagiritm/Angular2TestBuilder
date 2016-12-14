define(['../module'], function(controllerModule) {
    'use strict';
    controllerModule.controller("testBuilderController", [
    '$scope',
    '$http',
    '$location',
    'commonService',
    '$q',
    function(
        $scope,
        $http,
        $location,
        commonService,
        $q) {

        $scope.genFileShow = false;
        $scope.PbarShow = false;
        $scope.fileread = "";
        $scope.filename = "";
        $scope.fileObj = {
            filename: null,
            fileContent: null
        };


        var mf = {};


        $scope.readFile = function() {
            $scope.filename = "";
            $scope.fileread = "";
            resetProgress();
            angular.element('#fileJson').click();
        }
        var resetProgress = function() {
            $scope.genFileShow = false;
            $scope.PbarShow = false;
            angular.element(".progress-bar").css("width", "0%");
        }

        $scope.populate = function() {
            if($scope.filename.length==0){
                alert("Please select an Angular source file");
                return;
            }
            resetProgress();
            var files = $scope.filename.split(",");
            var cntIncr = 100 / files.length;
            var delStatus = false;
            $scope.PbarShow = true;
           
            if ($scope.fileread) {
               
                $http.get("/DelFolder").success(function(response) {
                    createSpec(0);
                });

                function createSpec(index) {
                   
                    if (index >= files.length) {
                        $http.get("/CreateZip").success(function(response) {
                            $scope.genFileShow = true;
                            alert("Test spec(s) created. Click the generated link to download.")
                        });
                        return;
                    }
                    file = index;
                    $scope.fileObj = {
                        filename: files[file],
                        fileContent: $scope.fileread[file].toString()
                    }
                    var pbar = (file + 1) * cntIncr;
                    if (pbar > 100) {
                        pbar = 100;
                    }
                    angular.element(".progress-bar").css("width", pbar.toString() + "%");
                    angular.element(".progress-bar").html(pbar.toString() + "%");
                    commonService.getControllerDetails($scope.fileObj)
                    .then(function(result){
                        createSpec(index + 1)
                    });

                }


            }
        }


        $scope.close = function() {
           
           
            window.top.close();
        }

    }
])
 });