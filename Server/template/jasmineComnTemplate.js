var $ = require('jquery');
var angular = require('angular');
var angular - mocks = require("angular-mocks");

//Declare all global variables here
 {globalvariables}

// Read mock data from external file uncomment this to read mock data from json file

// $.get('base/test/unit/claims/dental/JSON/dentalBasicClaim.json',function(data){
// 	var mockData=JSON.parse(data.toString());
// });

//Any other mock objects/ functions that is required can be intialized here
// require("generalFunctions");

//Main describe here
describe('{maindescribe}', function() {

    //beforeEach function.  create and intialize module, controllers and services here
    beforeEach(function() {
        spyOn(angular, 'element').and.callFake(mockData.angularFaked);
        module({
            modulename
        });
        inject(function({depFunctions}) {
            {depFunctionsIntialize}
            {directive}
            {httpBackend}
        });
    });

    afterEach(function() {
        {afterEach}
    });

    //create additional describes if needed

    //create your it and expect statements here
    {itStatements}



});