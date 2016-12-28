var fs = require('fs');
var path = require('path');
var beautify = require('js-beautify').js_beautify;
require('./string.extensions.js');
var wf = require('./writefactories');
var balanced = require('balanced-match');
const visitor = require('./visitor.js');
const ts = require('typescript');
const componentTemplateFile = './server/template/componentTemplate.js';
const serviceTemplateFile = './server/template/serviceTemplate.js';

var getangular2Specs = function (funObject, callback) {
    var dtStamp = new Date().getTime().toString();
    var foldername = path.join(__dirname, "../AngularSrc");
    dtStamp = "";
    //Add datetimestamp to invalidate cache
    var fname = path.join(foldername, funObject.filename).replace(".js", dtStamp + ".js");

    //Remove the commented lines
    funObject.fileContent = funObject.fileContent.replace(/\s\/\/.*/g, "");
    funObject.fileContent = funObject.fileContent.replace(/\/\*(.|[\r\n])*?\*\//g, ""); //multiline comments

    fs.writeFileSync(fname, funObject.fileContent);
    depArray = "";
    depfuncontent = "";
    //require will call for a method define which in turn 
    //will call mycontroller to return the dependencies
    if (require.resolve(fname)) {
        delete require.cache[require.resolve(fname)];
    }
    createAng2TestSpec(fname.replace(dtStamp, ""));
    //return depArray;
    callback(depArray); //callback once completed
}
var createAng2TestSpec = function (fname) {
    destName = fname.replace("AngularSrc", "specs").replace(".ts", ".spec.ts");
    var fileContent = fs.readFileSync(fname).toString();
    var compContent = '';
    // Parse a file
    var sourceFile = ts.createSourceFile(fname, fileContent, ts.ScriptTarget.ES6, /*setParentNodes */ true);
    var testingImport = "import %: ComponentFixture, inject, TestBed ^: from '@angular/core/testing';";
    var serviceImport = "import %: inject, TestBed ^: from '@angular/core/testing';"
    var platformBroswerImport = "import %: By^:                                from '@angular/platform-browser';";
    var coreImport = "import %: DebugElement^:                      from '@angular/core';";
    var beforeEachAsyncStart = "beforeEach( async(() => {";
    var beforeEachAsyncEnd = " .compileComponents();\n}));";
    var beforeEachStart = "beforeEach(() => {";
    var beforeEachEnd = "});";
    // parse the angular2 file 
    var angular2Obj = visitor.parse(sourceFile);
    var specType = angular2Obj.decorators.component.name;
    if (specType === 'Component') {
        compContent = fs.readFileSync(componentTemplateFile).toString();
    }
    else if (specType === 'Injectable') {
        compContent = fs.readFileSync(serviceTemplateFile).toString();
        testingImport = serviceImport;
        platformBroswerImport = '';
        coreImport = '';
        injectService(angular2Obj);
    }
    var ang2Imports = angular2Obj.imports = fileContent.match(/import.*/g);
    console.log(JSON.stringify(angular2Obj));
    var componentName = angular2Obj.class.name;
    var ang2Services = getAng2Services(angular2Obj);
    var providers = ang2Services.providers.join();
    var servicesVariable = ang2Services.servicesVariable;
    var servicesStub = ang2Services.servicesStub;
    var servicesInjector = ang2Services.servicesInjector;
    var itStatements = ang2Services.itStatements;
    var decorators = angular2Obj.decorators;
    var debugElement = '';
    var htmlElement = '';
    var spies = ang2Services.spies;
//    var moduleName =ang2Imports.match(/module/g).join();
    compContent = compContent.replace(/%TestComponentFileImports%/g, ang2Imports.join('').replace(/{/g, '%:').replace(/}/g, '^:'))
        .replace(/%componentName%/g, componentName)
        .replace(/%providers%/g, providers)
        .replace(/%servicesVariable%/g, servicesVariable)
        .replace(/%servicesStub%/g, servicesStub)
        .replace(/%serviceInjectors%/g, servicesInjector)
        .replace(/%beforeEachStart%/g, (decorators.component.templateUrl.length > 0) ? beforeEachAsyncStart : beforeEachStart)
        .replace(/%beforeEachEnd%/g, (decorators.component.templateUrl.length > 0) ? beforeEachAsyncEnd : beforeEachEnd)
        .replace(/%TestingImports%/g, testingImport)
        .replace(/%PlatformBrowserImports%/g, platformBroswerImport)
        .replace(/%CoreImports%/g, coreImport)
        .replace(/%debugElement%/g, debugElement)
        .replace(/%hTMLElement%/g, htmlElement)
        .replace(/%itStatements%/g, itStatements.join('\n'))
        // .replace(/%moduleName%/g,moduleName)
        .replace(/%spies%/g, spies.join('\n'));

    //    console.log(compContent);
    //beautify the template file and save it
    compContent = beautify(compContent);
    compContent = compContent.replace(/%:/g, '{').replace(/\^:/g, '}');
    fs.writeFileSync(destName, compContent);

}
var injectService = function (angular2Obj) {
    var parameterObj = {
        name: angular2Obj.class.name.toString().initSmall(),
        type: 'TypeReference',
        typeName: angular2Obj.class.name
    };
    var constructorObj = {
        name: 'constructor',
        type: 'Constructor',
        decorator: '',
        parameters: [],
        returnType: {}
    }
    constructorObj.parameters.push(parameterObj);
    for (var mthd in angular2Obj.class.methods) {
        if (angular2Obj.class.methods[mthd].name == 'constructor') {
            angular2Obj.class.methods[mthd].parameters.splice(0, 0, parameterObj);
            return;
        }
    }
    angular2Obj.class.methods.splice(0, 0, constructorObj);
}
var getAng2Services = function (angular2Obj) {
    var its = [];
    var inputIts = ['//Input Properties validation'];
    var actualProvider = [];
    var it='';
    var params = [];
    var methods = angular2Obj.class.methods;
    var className = angular2Obj.class.name;
    var specType = angular2Obj.decorators.component.name;
    var tempIt;
    var ang2ServicesObj = {
        providers: [],
        servicesVariable: '',
        servicesStub: '',
        servicesInjector: '',
        itStatements: inputIts.concat(its),
        spies: [],
    }
    ang2ServicesObj.spies.push(intializeSpies(specType));
    actualProvider.push(intializeProviders(specType));
    for (var method in methods) {
        var parameters = methods[method].parameters;
        var mthd = methods[method];
        params = [];
        for (var param in parameters) {
            var parameter = parameters[param];
            if (methods[method].name.trim() === 'constructor') {
                if (parameter.type === 'TypeReference') {
                    ang2ServicesObj.providers.push("".AppendLine('{0}provide: {1}, useValue:{2}{3}'.Format('{', parameter.typeName, parameter.name + 'Stub', '}')));
                    actualProvider.push("".AppendLine(parameter.typeName));
                    ang2ServicesObj.servicesVariable = ang2ServicesObj.servicesVariable.AppendLine('let {0}: {1};'.Format(parameter.name, parameter.typeName));
                    ang2ServicesObj.servicesStub = ang2ServicesObj.servicesStub.AppendLine('let ' + parameter.name + 'Stub = {};');
                    ang2ServicesObj.servicesInjector = ang2ServicesObj.servicesInjector.AppendLine(parameter.name + ' = TestBed.get(' + parameter.typeName + ');');
                    ang2ServicesObj.spies.push("".AppendLine('spyOn({0},methodName) // replace the methodName with the actual method of the service. ').Format(parameter.typeName));
                }
            }
            else {
                params.push(parameter.name);
                it = it.AppendLine("var {0}:{1};  //assign the value = paramValue)"
                    .Format(parameter.name,
                    (parameter.type === 'TypeReference') ? parameter.typeName :
                        parameter.type.replace('Keyword', '')));
            }
        }

        it = buildIts(className, mthd, params, specType);
        if (mthd.decorator === 'Input') {
            inputIts.push(it);
        }
        else {
            its.push(it);
        }


    }
    ang2ServicesObj.itStatements = (inputIts.length > 1) ? inputIts.concat(its) : its;
    
    
    if (specType === 'Component') {
        (ang2ServicesObj.spies.length > 1) ? ang2ServicesObj.spies.push(''.AppendLine('*/')) : ang2ServicesObj.spies = [''];
        actualProvider.push(''.AppendLine('*/'));
        ang2ServicesObj.providers = actualProvider.concat(ang2ServicesObj.providers);
    }
    else {
        ang2ServicesObj.providers = actualProvider;
    }

    return ang2ServicesObj;
}
var intializeProviders = function (specType) {
    var providers = '';
    if (specType == 'Component') {
        providers = providers.AppendLine('/*');
        providers = providers.AppendLine('uncomment these lines if you want to use the service, instead of mock');
    }
    return providers;
}
var intializeSpies = function (specType) {
    var spies = '';
    if (specType == 'Component') {
        spies = spies.AppendLine('//Spies');
        spies = spies.AppendLine('/* uncomment these lines if you want to use spies');
        spies = spies.AppendLine('//Use returnValue method of spy to return your mock data.');
        spies = spies.AppendLine('//Use callThrough method of spy to call the actual method');
    }
    return spies;
}
var getReturnType = function (mthd) {
    var retType;
    if (Object.getOwnPropertyNames(mthd.returnType).length > 0) {
        if (mthd.returnType.type === 'TypeReference') {
            retType = mthd.returnType.name;
        }
        else {
            retType = mthd.returnType.type.replace("Keyword", '');
        }
    }
    else {
        retType = "void";
    }
    return retType;
}
var buildIts = function (className, mthd, params, specType) {
    var it = "";
    var methodIt= "var actualValue = comp.{0}({1}); //execute the method";
    var fixDetect='fixture.detectChanges();';
    var retType = getReturnType(mthd);

    if(specType != 'Component'){
           methodIt="var actualValue = {0}.{0}({1}).subscribe(res => { return res;}); //execute the method".Format(className.initSmall());
            fixDetect='';
    }
    if ((mthd.name.trim() === 'constructor')) {
        if (specType === 'Component') {
            it = it.AppendLine("it ('should instantiate {0} ',()=>{ ".Format(className));
            it = it.AppendLine("expect (fixture.componentInstance instanceof {0}).toBe(true,'could not create {1}');".Format(className, className));
            it = it.AppendLine("});");
        }
        else {
            it = it.AppendLine("it('should instantiate {0} ', function(){".Format(className));
            it = it.AppendLine("expect({0}).not.toBe(null,'{0} service not instantiated');".Format(className));
            it = it.AppendLine("});");
         
        }
    }
    else if (mthd.decorator === 'Input') {
        it = it.AppendLine("it('should set the component input properties for {0}', function () {\n".Format(mthd.name));
        it = it.AppendLine("var expectedValue:{0}; //assign expected return value".Format(retType));
        it = it.AppendLine(" var actualValue;");
        it = it.AppendLine("comp.{0} = value //set the value here".Format(mthd.name));
        it = it.AppendLine("fixture.detectChanges();");
        it = it.AppendLine("let el = fixture.debugElement.query(By.css('css selector')).nativeElement;");
        it = it.AppendLine("expect(el).toBe(expectedValue, 'The actual value is not matching the expected value');");
        it = it.AppendLine("});");
    }

    else if (mthd.type == 'MethodDeclaration') {
        it = it.AppendLine("it('should execute method {0}',function(){\n".Format(mthd.name));
        it = it.AppendLine("var expectedValue:{0}; //assign expected return value".Format(retType));
        it = it.AppendLine(methodIt.Format(mthd.name, params.join(',')));
        it = it.AppendLine(fixDetect);
        it = it.AppendLine("expect(actualValue).toBe(expectedValue); //Change your it logic accordingly");
        it = it.AppendLine("//add more expects here");
        it = it.AppendLine("});");
    };
    // //the final clean up in case of service
    // if(specType!='Component'){
    //    it =  it.replace(/comp/g,className.initSmall());

    // }
    return it;
}

module.exports = {
    getangular2Specs: getangular2Specs
}