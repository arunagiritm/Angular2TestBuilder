"use strict";
var ts = require("typescript");
function parse(sourceFile) {
    var angular2Class = {
        decorators: {
            component: {
                name: '',
                moduleId: '',
                selector: '',
                templateUrl: '',
                styleUrls: [],
                providers: []
            },
            input: [],
            output: []
        },
        class: {
            name: '',
            methods: []
        },
        imports: []
    };
    var component = angular2Class.decorators.component;
    var decorators = angular2Class.decorators;
    var parseClass = angular2Class.class;
    var parseMethods = angular2Class.class.methods;
    var parseMethodModel = {
        name: '',
        decorator: '',
        parameters: [],
        returnType: {}
    };
    var parseParameterModel = {
        name: '',
        type: '',
        typeName: ''
    };
    delintNode(sourceFile);
    //console.log(JSON.stringify(angular2Class));
    return angular2Class;
    function delintNode(node) {
        ////  console.log(`${node} : ${node.kind}`);
        var propertyType;
        switch (node.kind) {
            case ts.SyntaxKind.ClassDeclaration:
                angular2Class.class.name = node.name.text;
                //console.log(`Class Name : ${node.name.text}`);
                node.decorators.forEach(function (decorator) {
                    component.name = decorator.expression.expression.text;
                    //console.log(`Decorator name : ${decorator.expression.expression.text}`);
                    decorator.expression.arguments.forEach(function (argument) {
                        argument.properties.forEach(function (property) {
                            //console.log(`property name: ${property.name.text} `);
                            if (property.initializer.name) {
                                if (component[property.name.text].length > 0) {
                                    component[property.name.text] += ',' + property.initializer.name.text;
                                }
                                else {
                                    component[property.name.text] = property.initializer.name.text;
                                }
                            }
                            else if (property.initializer.elements) {
                                property.initializer.elements.forEach(function (element) {
                                    if (component[property.name.text].length > 0) {
                                        component[property.name.text] += ',' + element.text;
                                    }
                                    else {
                                        component[property.name.text] = element.text;
                                    }
                                    //console.log(`value : ${element.text}`)
                                });
                            }
                            else {
                                component[property.name.text] = property.initializer.text;
                            }
                        });
                    });
                });
                node.members.forEach(function (member) {
                    var parseMethodModelLocal = JSON.parse(JSON.stringify(parseMethodModel));
                    if (member.name) {
                        parseMethodModelLocal.name = member.name.text;
                    }
                    else if (member.kind == ts.SyntaxKind.Constructor) {
                        parseMethodModelLocal.name = 'constructor';
                    }
                    if (member.decorators && member.decorators.length > 0) {
                        member.decorators.forEach(function (decorator) {
                            parseMethodModelLocal.decorator = decorator.expression.expression.text;
                            //console.log(`Decorator type: ${decorator.expression.expression.text}`);
                        });
                        if (member.type && member.type.typeName) {
                            parseMethodModelLocal.returnType.name = member.type.typeName.text;
                            parseMethodModelLocal.returnType.type = ts.SyntaxKind[member.type.kind];
                        }
                    }
                    else if (member.type) {
                        parseMethodModelLocal.returnType.name = '';
                        parseMethodModelLocal.returnType.type = ts.SyntaxKind[member.type.kind];
                    }
                    if (member.parameters) {
                        member.parameters.forEach(function (parameter) {
                            var parseParameterModelLocal = JSON.parse(JSON.stringify(parseParameterModel));
                            parseParameterModelLocal.name = parameter.name.text;
                            //console.log(`Parameter name:  ${parameter.name.text}`);
                            if (parameter.type) {
                                parseParameterModelLocal.type = ts.SyntaxKind[parameter.type.kind];
                                if (parameter.type.typeName) {
                                    parseParameterModelLocal.typeName = parameter.type.typeName.text;
                                }
                            }
                            parseMethodModelLocal.parameters.push(parseParameterModelLocal);
                        });
                    }
                    ;
                    parseMethods.push(parseMethodModelLocal);
                });
                break;
        }
        ts.forEachChild(node, delintNode);
    }
    function report(node, message) {
        var _a = sourceFile.getLineAndCharacterOfPosition(node.getStart()), line = _a.line, character = _a.character;
        //console.log(`${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`);
    }
}
exports.parse = parse;
//# sourceMappingURL=visitor.js.map