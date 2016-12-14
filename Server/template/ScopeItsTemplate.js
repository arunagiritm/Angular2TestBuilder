//twowayscopeStart
it('{twoway} on isolated scope should be two-way bound', function() {
    var isolatedScope = directiveElem.isolateScope();

    isolatedScope. {twoway}.prop = "value2";

    expect(scope. {twoway}.prop).toEqual('value2');
});
//twowayscopeEnd
//onewayscopeStart
it('{oneway} on isolated scope should be one-way bound', function() {
    var isolatedScope = directiveElem.isolateScope();

    isolatedScope. {oneway} = false;

    expect(scope. {oneway}).toEqual(true);
});
//onewayscopeEnd
//functionscopeStart
it('{functionScope} should be a function', function() {
    var isolatedScope = directiveElem.isolateScope();

    expect(typeof(isolatedScope. {functionScope})).toEqual('function');
});

it('should call {functionScope} method of scope when invoked from isolated scope', function() {
    var isolatedScope = directiveElem.isolateScope();
    isolatedScope. {functionScope}();

    expect(scope. {functionScope}).toHaveBeenCalled();
});
//functionscopeEnd

//requireStart
it('should fail if {requireScope} is not specified', function() {
    expect(function() {
        getCompiledElement('<input type="text" {directiveName} />');
    }).toThrow();
});

it('should work if ng-model is specified and not wrapped in form', function() {
    expect(function() {
        getCompiledElement('<div><input type="text" {requireScope}="name" {directiveName} /></div>');
    }).not.toThrow();
});
//requireEnd
//replaceStart
it('should have replaced directive element', function() {
    var compiledDirective = compile(angular.element('<div><{directiveName}></{directiveName}></div>'))(scope);
    scope.$digest();

    expect(compiledDirective.find('{directiveName}').length).toEqual(0);
});
//replaceEnd
//transcludeStart
it('should have an ng-transclude directive in it', function() {
    var compiledDirective = compile(angular.element('<div><{directiveName}></{directiveName}></div>'))(scope);
    var transcludeElem = compiledDirective.find('div[ng-transclude]');
    expect(transcludeElem.length).toBe(1);
});
//transcludeEnd
//ServiceItStart
describe('Call {serviceMethod} method', function(){

    it('Success callback && pass the null data', function(){

        url = mockData.{serviceMethod}.url;
        sendSuccessRequest(url, mockData.{serviceMethod}.inValidData);
        var promise = {serviceMethod}(mockData.{serviceMethod}.inValidData);
        promise.then(function(res){
            expect(res.route).toEqual(mockData.{serviceMethod}.route);
        });
        
    });

    it('Success callback for {serviceMethod} && pass the required data', function(){
      
        url = mockData.{serviceMethod}.url;
        sendSuccessRequest(url, mockData.{serviceMethod}.ValidData);
        var promise = {serviceMethod}(mockData.{serviceMethod}.ValidData);
        promise.then(function(res){
            expect(res.route).toEqual(mockData.{serviceMethod}.route);
            expect(res.providerID).toEqual(mockData.providerID);
        });
        
    });

    it('Failure callback for {serviceMethod}', function(){

        url = mockData.{serviceMethod}.url;
        sendFailureRequest(url, mockData.{serviceMethod}.ValidData);
        var promise = {serviceMethod}(mockData.{serviceMethod}.ValidData);

        promise.then(function(res){
            // console.log("Got a response");
        }, function(e){
            expect(e.status).toBe(0);
        });
        
    });
});
//ServiceItEnd
//httpMockMethodStart
  function sendSuccessRequest(url, data) {
      $httpBackend.whenGET(url).respond(200, data);
  }

  function sendFailureRequest(url, data) {
      $httpBackend.whenGET(url).respond(0, {});
  }
//httpMockMethodEnd