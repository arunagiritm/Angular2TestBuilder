var fs = require('fs');
var path = require('path');
var beautify = require('js-beautify').js_beautify;
require('./string.extensions.js');
var wf = require('./writefactories');
var balanced = require('balanced-match');
var depArray;
var depfuncontent;
var depType;
var directiveName;
var isAMD = true;
var jasmineTemplateFile = "./server/template/jasmineTemplate.js";
var jasmineCmnTemplateFile = "./server/template/jasmineComnTemplate.js";
var amdTemplateFile = "./server/template/amdTemplate.js";
var scopeTemplateFile = "./server/template/scopeItsTemplate.js"
const visitor = require('./visitor.js');
const ts = require('typescript');
var componentTemplateFile = './server/template/componentTemplate.js'

global.define = function(filename, callback) {
    depType = "";
    callback(mycontroller);
}

global.mycontroller = {

    controller: function(ctrlName, inputArray) {
        var scope = {};
        if (depType == "") {
            depType = "controller";
        }
        if (typeof inputArray != 'undefined') {

            //dependecy not annotated
            if (typeof inputArray == 'function') {
                depfuncontent = inputArray;
                var bfind = balanced("(", ")", depfuncontent.toString().match(/function\s*\([^\)]*\s*\)/g)[0]);
                depArray = bfind.body.split(",");
            } else {
                //Last parameter is the function content
                depfuncontent = inputArray[inputArray.length - 1];
                //reduce the length by 1 to remove the last function parameter
                inputArray.length = inputArray.length - 1;
                depArray = inputArray;
            }
        }
    },
    factory: function(ctrlName, inputArray) {
        depType = "factory";
        if (ctrlName.match(/service/gi)) {
            depType = "service";
        }
        mycontroller.controller(ctrlName, inputArray);
    },
    service: function(ctrlName, inputArray) {
        depType = "service";
        mycontroller.controller(ctrlName, inputArray);
    },
    provider: function(ctrlName, inputArray) {
        depType = "provider";
        mycontroller.controller(ctrlName, inputArray);
    },
    directive: function(ctrlName, inputArray) {
        depType = "directive";
        directiveName = ctrlName;
        mycontroller.controller(ctrlName, inputArray);
    },
    config: function(ctrlName, inputArray) {
        mycontroller.controller(ctrlName, inputArray);
    }
}

var getDependencies = function(funObject, callback) {

    var dtStamp = new Date().getTime().toString();
    var foldername = path.join(__dirname, "../AngularSrc");
    dtStamp = "";
    //Add datetimestamp to invalidate cache
    var fname = path.join(foldername, funObject.filename).replace(".js", dtStamp + ".js");

    //Remove the commented lines
    funObject.fileContent = funObject.fileContent.replace(/\s\/\/.*/g, ""); 
    funObject.fileContent = funObject.fileContent.replace(/\/\*(.|[\r\n])*?\*\//g, ""); //multiline comments
    //Check whether it is amd module or commonJs
    if (!funObject.fileContent.match(/define\s*\(/)) {
        isAMD = false;
        var start = funObject.fileContent.search(/.(controller|factory|service|provider|directive|config)\s*\(/g);
        var angContent = funObject.fileContent.substring(start);
        var bfind = balanced("(", ")", angContent);
        if (bfind) {
            var atemplate = fs.readFileSync(amdTemplateFile).toString();
            var fullCode = bfind.pre + "(" + bfind.body + ")";
            funObject.fileContent = atemplate.replace("{actualcode}", fullCode);
        }
    }

    fs.writeFileSync(fname, funObject.fileContent);
    depArray = "";
    depfuncontent = "";
    //require will call for a method define which in turn 
    //will call mycontroller to return the dependencies
    if (require.resolve(fname)) {
        delete require.cache[require.resolve(fname)];
    }
    var fcontent = require(fname);
    //wait for the file to be read
    var depMethods = getallFunctions(depfuncontent);
    var dirObject = getDirectiveObject(depfuncontent, directiveName)
    createTestSpec(fname.replace(dtStamp, ""), depArray, depMethods, dirObject);
    //return depArray;
    callback(depArray); //callback once completed
}

var getDirectiveObject = function(fcontent, directiveName) {
    var sMatch;
    var dirObject = {},
        directiveScope = null,
        directiveRequire = null,
        directiveReplace = null,
        directiveTransclude = null;

    //directiveName = fcontent.toString().match(/directive\(.*,/);
    directiveScope = fcontent.toString().match(/scope\s*:\s*(.(\r|\n)*)*?}/);
    directiveRequire = fcontent.toString().match(/require\s*:\s*.*,/);
    directiveTransclude = fcontent.toString().match(/transclude\s*:\s*.*,/);
    directiveReplace = fcontent.toString().match(/replace\s*:\s*.*,/);

    if (null != directiveName) {
        directiveName = directiveName.replace(/\/\*(.(\n)*)*\*\//g, "").replace(/\/\/.*/g, "");
        directiveName = directiveName.replace(/(directive|\(|:|\s|'|"|,|\[|\])/g, "");
        dirObject.directiveName = directiveName.replace(/([A-Z])/g, function(capLetter) {
            return "-" + capLetter.toLowerCase();
        })
    }
    if (null != directiveScope) {
        //will build a key value pair eg.,({fileread:"=",filescope:"@",onChange:"&"})
        var dscopeObj = {};
        var dscopeArr;
        //remove remarks
        directiveScope = directiveScope[0].replace(/\/\*(.(\n)*)*\*\//g, "").replace(/\/\/.*/g, "");
        directiveScope = directiveScope.replace(/(scope:|\s|\{|\}|'|")/g, "").split(",");
        for (ls in directiveScope) {
            dscopeArr = directiveScope[ls].split(":");
            if (dscopeArr.length >= 0) {
                dscopeObj[dscopeArr[0]] = dscopeArr[1];
            }
        }
        dirObject.directiveScope = dscopeObj;
    }
    if (null != directiveRequire) {
        //will return an array of require object. eg.,(ngModel,form)
        directiveRequire = directiveRequire[0].replace(/\/\*(.(\n)*)*\*\//g, "").replace(/\/\/.*/g, "");
        dirObject.directiveRequire = directiveRequire.replace(/(require:|\s|'|"|\[|\])/g, "").split(",");
    }
    if (null != directiveTransclude) {
        //will return a string "true"
        directiveTransclude = directiveTransclude[0].replace(/\/\*(.(\n)*)*\*\//g, "").replace(/\/\/.*/g, "");
        dirObject.directiveTransclude = directiveTransclude.replace(/(transclude:|\s|'|"|,|\[|\])/g, "");
    }
    if (null != directiveReplace) {
        //will return a string "true"
        directiveReplace = directiveReplace[0].replace(/\/\*(.(\n)*)*\*\//g, "").replace(/\/\/.*/g, "");
        dirObject.directiveReplace = directiveReplace.replace(/(replace:|\s|'|"|,|\[|\])/g, "");
    }

    return dirObject;

}
var buildDirectiveItStaments = function(dirObject) {
    //call builDirectiveScope to build isolated scope its of a directive
    var scopeTemplate = fs.readFileSync(scopeTemplateFile).toString();
    var scopeIts = "";
    scopeIts = scopeIts.AppendLine(buildDirectiveScopeIts(dirObject, scopeTemplate));
    scopeIts = scopeIts.AppendLine(buildDirectiveReplaceIts(dirObject, scopeTemplate));
    scopeIts = scopeIts.AppendLine(buildDirectiveRequireIts(dirObject, scopeTemplate));
    scopeIts = scopeIts.AppendLine(buildDirectiveTranscludeIts(dirObject, scopeTemplate));
    return scopeIts;
}
var buildDirectiveRequireIts = function(dirObject, scopeTemplate) {
    var requireCode = scopeTemplate.match(/\/\/require(.(\r|\n)*)*?End/)[0].replace(/\/\/.*/g, "");;
    var dirRequireIts = "";
    for (drequire in dirObject.directiveRequire) {
        dirRequireIts = dirRequireIts.AppendLine(requireCode.replace(/{directiveName}/g, dirObject.directiveName));
        dirRequireIts = dirRequireIts.AppendLine(requireCode.replace(/{requireScope}/g, drequire));
    }

    return dirRequireIts;
}
var buildDirectiveTranscludeIts = function(dirObject, scopeTemplate) {
    var transcludeCode = scopeTemplate.match(/\/\/transclude(.(\r|\n)*)*?End/)[0].replace(/\/\/.*/g, "");
    var dirTranscludeIts = "";
    if (dirObject.directiveTransclude && dirObject.directiveTransclude.toUpperCase() == "TRUE") {
        dirTranscludeIts = dirTranscludeIts.AppendLine(transcludeCode.replace(/{directiveName}/g, dirObject.directiveName));
    }
    return dirTranscludeIts;
}

var buildDirectiveReplaceIts = function(dirObject, scopeTemplate) {
    var replaceCode = scopeTemplate.match(/\/\/replace(.(\r|\n)*)*?End/)[0].replace(/\/\/.*/g, "");;
    var dirReplaceIts = "";
    if (dirObject.directiveReplace && dirObject.directiveReplace.toUpperCase() == "TRUE") {
        dirReplaceIts = dirReplaceIts.AppendLine(replaceCode.replace(/{directiveName}/g, dirObject.directiveName));
    }
    return dirReplaceIts;
}

var buildDirectiveScopeIts = function(dirObject, scopeTemplate) {

    var twowayCode = scopeTemplate.match(/\/\/two(.(\r|\n)*)*?End/)[0].replace(/\/\/.*/g, "");;
    var onewayCode = scopeTemplate.match(/\/\/one(.(\r|\n)*)*?End/)[0].replace(/\/\/.*/g, "");;
    var funCode = scopeTemplate.match(/\/\/function(.(\r|\n)*)*?End/)[0].replace(/\/\/.*/g, "");;
    var dirScopeIts = "";
    if (dirObject.directiveScope) {
        for (dscope in dirObject.directiveScope) {
            if (dirObject.directiveScope[dscope] == "=") {
                //two way binding
                dirScopeIts = dirScopeIts.AppendLine(twowayCode.replace(/{twoway}/g, dscope));
            } else if (dscope == "@") {
                //one way binding
                dirScopeIts = dirScopeIts.AppendLine(onewayCode.replace(/{oneway}/g, dscope));
            } else if (dscope == "&") {
                //method
                dirScopeIts = dirScopeIts.AppendLine(funCode.replace(/{functionScope}/g, dscope));
            }
        }


    }
    return dirScopeIts;
}
var buildServiceMock = function() {
    var scopeTemplate = fs.readFileSync(scopeTemplateFile).toString();
    var scopeIts = "";
    var serMock = scopeTemplate.match(/\/\/httpMockMethod(.(\r|\n)*)*?End/)[0].replace(/\/\/.*/g, "");
    scopeIts = scopeIts.AppendLine(serMock);
    return scopeIts;
}

var buildServiceIts = function() {
    var scopeTemplate = fs.readFileSync(scopeTemplateFile).toString();
    var scopeIts = "";
    var serviceIts = scopeTemplate.match(/\/\/ServiceIt(.(\r|\n)*)*?End/)[0].replace(/\/\/.*/g, "");
    return serviceIts;
}
var getallFunctions = function(fcontent) {
    //get the content of the file and do a regex search
    //for scope object and constructor functions
    var fcontentString = fcontent.toString();

    var scopeRegex = /([\w.]+)\s*(=|:)\s*function\s*\(.*\)/gi;
    var vmRegex = /\w+\s*=\s*this\s*;/gi;
    var depMethods = {};
    var functionName;
    var functionContent;
    var funStr;
    var funLoc;
    var vmStr = "";

    //console.log(fcontent);
    //check whether controller as syntax is used to assign "this" to local variable
    var vmMatch = fcontentString.match(vmRegex);
    if (vmMatch) {
        var vmStr = vmMatch[0].trim();
        vmStr = vmStr.substring(0, vmStr.indexOf("="));
    }
    var scopeMethods = fcontentString.match(scopeRegex);
    if (scopeMethods != null && scopeMethods.length > 0) {

        for (sm in scopeMethods) {
            funStr = scopeMethods[sm].trim().replace("$scope", "scope");
            if (vmStr.length > 0) { //controller as is being used then replace the $scope equivalent also
                funStr = scopeMethods[sm].trim().replace(vmStr, "scope");
            }
            funLoc = funStr.indexOf("=");
            if (funLoc < 0) {
                funLoc = funStr.indexOf(":");
            }
            functionName = funStr.substring(0, funLoc);
            functionContent = funStr.substring(funLoc + 1);
            depMethods[functionName] = getFunctionArguments(functionContent);
        }
        return depMethods;
    }

    return null;

}
var getFunctionArguments = function(func) {
    // First match everything inside the function argument parens.
    if (typeof func == 'function') {
        var args = func.toString().match(/function\s.*?\(([^)]*)\)/);
    } else {
        var startloc, endLoc;
        startloc = func.indexOf("(");
        var args = func.substring(startloc + 1);
        endLoc = args.lastIndexOf(")");
        args = args.substring(0, endLoc);
    }


    // Split the arguments string into an array comma delimited.
    return args.split(',').map(function(arg) {
        // Ensure no inline comments are parsed and trim the whitespace.
        return arg.replace(/\/\*.*\*\//, '').trim();
    }).filter(function(arg) {
        // Ensure no undefined values are added.
        return arg;
    });

}
var createTestSpec = function(filename, depArray, depMethods, dirObject) {
    var tplFile = fs.readFileSync((isAMD) ? jasmineTemplateFile : jasmineCmnTemplateFile);
    var depStr;
    //Define all template replace variable and intialize
    var globalvariables = "",
        maindescribe = "",
        modulename = "he",
        depFunctions = "",
        depFunctionsIntialize = "",
        depControllerIntialize = "",
        itStatements = "",
        fname = path.basename(filename, path.extname(filename)),
        destName = filename.replace("AngularSrc", "specs").replace(".js", ".spec.js"),
        thatRegex = /that.+\./gi,
        httpBackend = (fname.match(/service/gi)) ? "$httpBackend.whenGET(/.*(\.json|\.html)/gi).respond(200, {})" : "",
        afterEach = "",
        directive = "",
        dirName = "";


    globalvariables = "var " + fname + ",";
    maindescribe = fname.replace("//", "#");
    // modulename = "he";
    depFunctions = "";
    if (httpBackend.length > 0) {
        afterEach = afterEach.AppendLine("$httpBackend.verifyNoOutstandingExpectation();");
        afterEach = afterEach.AppendLine("$httpBackend.verifyNoOutstandingRequest();");
    }
    //Add $controller service if the angular service is of controller type
    if (depType == "controller") {
        depFunctions = depFunctions.append("$rootScope,$controller,");
        depFunctionsIntialize = "".AppendLine("scope = $rootScope.$new();");
        depControllerIntialize = fname + "= $controller('" + fname + "', {";
        globalvariables = globalvariables.AppendLine("scope,");
    } else if (depType == "service") {
        depFunctions = depFunctions.append("$rootScope,_$httpBackend_,");
        depFunctionsIntialize = "".AppendLine("scope = $rootScope.$new();");
        depFunctionsIntialize = depFunctionsIntialize.AppendLine("$httpBackend = _$httpBackend_;");
        globalvariables = globalvariables.AppendLine(buildServiceMock());
        globalvariables = "var " + fname + ","; //overwrite as we want the mock method above variable declaration
        globalvariables = globalvariables.AppendLine("scope,");
        globalvariables = globalvariables.AppendLine("$httpBackend,");

    } else if (depType == "directive") {
        depFunctions = depFunctions.append("$rootScope,$compile,");
        depFunctionsIntialize = depFunctionsIntialize.AppendLine("scope = $rootScope.$new();");
        depFunctionsIntialize = depFunctionsIntialize.AppendLine("compile = $compile;");
        depFunctionsIntialize = depFunctionsIntialize.AppendLine(fname + "= getCompiledElement();");
        depFunctionsIntialize = depFunctionsIntialize.AppendLine("directiveElem = getCompiledElement();");
        depFunctionsIntialize = depFunctionsIntialize.AppendLine("function getCompiledElement() {");
        depFunctionsIntialize = depFunctionsIntialize.AppendLine("var template=angular.element('<div'" + dirObject.directiveName + "'> </div>');");
        depFunctionsIntialize = depFunctionsIntialize.AppendLine(" var element = angular.element(template);");
        depFunctionsIntialize = depFunctionsIntialize.AppendLine("var compiledElement = compile(element)(scope);");
        depFunctionsIntialize = depFunctionsIntialize.AppendLine("scope.$digest();");
        depFunctionsIntialize = depFunctionsIntialize.AppendLine("return compiledElement");
        depFunctionsIntialize = depFunctionsIntialize.AppendLine("}");
        globalvariables = globalvariables.AppendLine("scope,");
        globalvariables = globalvariables.AppendLine("compile,");

    } else {
        depFunctions = depFunctions.append("_" + fname + "_,");
        depControllerIntialize = fname + "= _" + fname + "_;";
    }

    //Loop through the dependecy array injected functions
    if (depArray != null) {
        for (deparr in depArray) {
            depStr = depArray[deparr].toString().trim();
            if (depStr == "") {
                continue;
            } //do not do for empty string
            globalvariables = globalvariables.AppendLine(depStr + ",");

            //If the dependcy starts with d then it is resolved in the route. 
            //No actual service exists for this, so skip those services
            if (!depStr.startsWith("d_") && !depStr.startsWith("$scope")) {
                depFunctions = depFunctions.append(((depStr == "$scope") ? "" : "_" + depStr) + "_,");
                depFunctionsIntialize = depFunctionsIntialize.AppendLine(depStr + " = _" + depStr + "_;")
            }
            //If angular service is of controller type dependency starts with d
            //Intialize with mock data 
            if (depType == "controller") {
                if (depStr.startsWith("d_") || depStr.startsWith("$scope"))
                    depControllerIntialize = depControllerIntialize.AppendLine(depStr + ":" + ((depStr == "$scope") ? "scope" : "mockdata.EmptyString;"));
            }

        }
        depControllerIntialize = depControllerIntialize.AppendLine("})");
    }
    globalvariables = globalvariables.trim().endsWithRemove("\n").endsWithRemove(",").append(";");
    depFunctions = depFunctions.trim().endsWithRemove("\n").endsWithRemove(",");



    depFunctionsIntialize = depFunctionsIntialize + depControllerIntialize + ";";
    itStatements = itStatements.AppendLine("it('should instantiate " + fname + "', function(){");
    itStatements = itStatements.AppendLine("expect(" + fname + ").toBeDefined();");

    if (depType == "controller") {
        itStatements = itStatements.AppendLine("expect(scope).toBeDefined();");
        itStatements = itStatements.AppendLine("});");
    } else if (depType == "directive") {
        //Build it statements for directives

        itStatements = itStatements.AppendLine("});");
        itStatements = itStatements.AppendLine(buildDirectiveItStaments(dirObject));
    } else {
        itStatements = itStatements.AppendLine("});");
    }
    if (depType != directive) {
        if (depMethods != null) {
            var serviceIts = buildServiceIts();
            //Loop through all the methods defined in angular services
            //and create jasmine it statements for them
            for (depmthd in depMethods) {
                itStatements = itStatements.AppendLine("");
                if (depType == "service") {
                    itStatements = itStatements.AppendLine(serviceIts.replace(/{serviceMethod}/g, depmthd));
                } else {
                    itStatements = itStatements.AppendLine("it('should call " + depmthd + "', function(){");
                    //itStatements.AppendLine(""+depMethods[depmthd]+ "= mockdata."+ depmthd +");" );
                    var tmpmethod = (depmthd.match(/\./)) ? depmthd : fname + "." + depmthd;
                    itStatements = itStatements.AppendLine("//Invoke the method call");
                    itStatements = itStatements.AppendLine((tmpmethod.replace(thatRegex, fname + ".") + "( " + replaceInArray(depMethods[depmthd], "mockData.") + ");"));
                    itStatements = itStatements.AppendLine("//modify your expect statement to match your logic");
                    itStatements = itStatements.AppendLine("expect(" + tmpmethod.replace(thatRegex, fname + ".") + ").toBeTrue()");
                    itStatements = itStatements.AppendLine("});");
                }

            }
        }
    }

    //Read the template file and do the replacements
    tplFile = tplFile.toString();
    tplFile = tplFile.replace("{globalvariables}", globalvariables);
    tplFile = tplFile.replace("{maindescribe}", maindescribe);
    tplFile = tplFile.replace("{modulename}", modulename);
    tplFile = tplFile.replace("{depFunctions}", depFunctions);
    tplFile = tplFile.replace("{depFunctionsIntialize}", depFunctionsIntialize);
    tplFile = tplFile.replace("{itStatements}", itStatements);
    tplFile = tplFile.replace("{afterEach}", afterEach);
    tplFile = tplFile.replace("{httpBackend}", httpBackend);
    tplFile = tplFile.replace("{directive}", directive);
    //console.log(tplFile);
    //beautify the template file and save it
    tplFile = beautify(tplFile);
    fs.writeFileSync(destName, tplFile);
    //wf.CreateZip(foldername,fname);
    return;

}
var replaceInArray = function(arrayObj, item) {
    var newArray = arrayObj.slice();
    for (aobj in newArray) {
        newArray[aobj] = item + newArray[aobj];
    }
    return newArray.join(",");
}
var getangular2Specs = function(funObject,callback){
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
var createAng2TestSpec = function(fname){
    destName = fname.replace("AngularSrc", "specs").replace(".ts", ".spec.ts");
    var fileContent = fs.readFileSync(fname).toString();
    var compContent = fs.readFileSync(componentTemplateFile).toString();
    // Parse a file
    var sourceFile = ts.createSourceFile(fname, fileContent, ts.ScriptTarget.ES6, /*setParentNodes */ true);
    var testingImport = "import { ComponentFixture, inject, TestBed } from '@angular/core/testing';";
    var platformBroswerImport ="import { By }                                from '@angular/platform-browser';";
    var coreImport = "import { DebugElement }                      from '@angular/core';";
    var beforeEachAsyncStart="beforeEach( async(() => {";
    var beforeEachAsyncEnd = " .compileComponents();\n}));";
    var beforeEachStart = "beforeEach(() => {";
    var beforeEachEnd = "});";
    // parse the angular2 file 
    var angular2Obj = visitor.parse(sourceFile);
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
    compContent = compContent.replace(/%TestComponentFileImports%/g,ang2Imports.join(''))
                             .replace(/%componentName%/g,componentName)
                             .replace(/%providers%/g,providers)
                             .replace(/%servicesVariable%/g,servicesVariable)
                             .replace(/%servicesStub%/g,servicesStub)
                             .replace(/%serviceInjectors%/g,servicesInjector)
                             .replace(/%beforeEachStart%/g, (decorators.component.templateUrl.length > 0)? beforeEachAsyncStart : beforeEachStart)
                             .replace(/%beforeEachEnd%/g,(decorators.component.templateUrl.length > 0) ? beforeEachAsyncEnd : beforeEachEnd)
                             .replace(/%TestingImports%/g,testingImport)
                             .replace(/%PlatformBrowserImports%/g,platformBroswerImport)
                             .replace(/%CoreImports%/g,coreImport)
                             .replace(/%itStatements%/g,itStatements.join('\n'));
//    console.log(compContent);
    //beautify the template file and save it
    compContent = beautify(compContent);
    fs.writeFileSync(destName, compContent);
                            
}
var getAng2Services = function(angular2Obj){
    var its=[];
    var it;
    var params=[];
    var methods = angular2Obj.class.methods;
    var tempIt;
    var ang2ServicesObj={
        providers:[],
        servicesVariable:'',
        servicesStub: '',
        servicesInjector: '',
        itStatements: its
    }
    for(var method in methods ){
            var parameters = methods[method].parameters;
            var mthd = methods[method];
            params=[];
            it = "";
            it = it.AppendLine("it('should execute method {0}',function(){\n".Format(mthd.name));
            for (var param in parameters){
                var parameter =parameters[param];
                if(methods[method].name.trim()==='constructor'){
                    if(parameter.type ==='TypeReference'){
                        ang2ServicesObj.providers.push("".AppendLine('{0}provide: {1}, useValue:{2}{3}'.Format('{',parameter.typeName, parameter.name+'Stub','}')));
                        ang2ServicesObj.servicesVariable=ang2ServicesObj.servicesVariable.AppendLine('let {0}: {1};'.Format(parameter.name, parameter.typeName));
                        ang2ServicesObj.servicesStub=ang2ServicesObj.servicesStub.AppendLine('let '+ parameter.name + 'Stub = {};');
                        ang2ServicesObj.servicesInjector=ang2ServicesObj.servicesInjector.AppendLine(parameter.name + ' = TestBed.get(' + parameter.typeName + ');');
                    }
                }
                else {
                    params.push(parameter.name);
                    it = it.AppendLine("var {0}:{1};  //assign the value = paramValue)"
                           .Format(parameter.name,
                           (parameter.type === 'TypeReference') ? parameter.typeName : 
                           parameter.type.replace('Keyword','')));
            }
      
        }
            var retType;
            if(Object.getOwnPropertyNames(mthd.returnType).length > 0){
                if( mthd.returnType.type ==='TypeReference'){
                    retType = mthd.returnType.name;
                }
                else{
                    retType = mthd.returnType.type.replace("Keyword",'');
                }
            }
            else {
                retType="void";
            } 
            it = it.AppendLine("var expectedValue:{0}; //assign expected return value".Format(retType));
            it = it.AppendLine("var actualValue = comp.{0}({1}); //execute the method".Format(mthd.name,params.join(',')));
            it = it.AppendLine("fixture.detectChanges();");
            it = it.AppendLine("expect(actualValue).toBe(expectedValue); //Change your it logic accordingly");
            it = it.AppendLine("//add more expects here");
            it = it.AppendLine("});")
            its.push(it);
    }    
    return ang2ServicesObj;
}

module.exports = {
    getDependencies: getDependencies,
    getangular2Specs:getangular2Specs
}