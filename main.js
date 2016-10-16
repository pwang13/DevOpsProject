var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var fs = require("fs");
var mock = require('mock-fs');
var _ = require('underscore');
var Random = require('random-js');
var subject;
function main()
{
   var args = process.argv.slice(2);
   if( args.length == 0 )
   {
      args = ["subject.js"];
   }
   subject = args[0];
   var filePath = subject;
   constraints(filePath);
   generateTestCases()
}

var engine = Random.engines.mt19937().autoSeed();

function createConcreteIntegerValue( greaterThan, constraintValue )
{
   constraintValue = parseFloat(constraintValue);
   if( greaterThan )
      return Random.integer(constraintValue+1,constraintValue+10)(engine);
   else
      return Random.integer(constraintValue-10,constraintValue-1)(engine);
}

function Constraint(properties)
{
   this.ident = properties.ident;
   this.value = properties.value;
   this.funcName = properties.funcName;
   this.kind = properties.kind;
}

var functionConstraints = {};

function generateTestCases()
{
   var content = "var subject = require('./" + subject + "')\nvar mock = require('mock-fs');\n";
   for ( var funcName in functionConstraints ) {
      var constraints = functionConstraints[funcName].constraints;
      var mockFs = _.some(constraints, { kind: 'mockFs' });

      if( mockFs ) {
         var mockFileLibrary = {
            empty: {},
            notEmpty: {
               empty: '',
               notEmpty: 'hello'
            }
         };
         content += "mock(" + JSON.stringify(mockFileLibrary) + ");\n";

         var combinations = generateArgCombinations(functionConstraints[funcName]);
         for(var i = 0; i < combinations.length; i++) {
            content += "\tsubject.{0}({1});\n".format( funcName, combinations[i] );
         }
         content+="mock.restore();\n";
      }
      else
      {
         if(functionConstraints[funcName].params.length > 0) {
            var combinations = generateArgCombinations(functionConstraints[funcName]);
            for(var i = 0; i < combinations.length; i++) {
               content += "subject.{0}({1});\n".format( funcName, combinations[i] );
            }
         } else {
            content += "subject.{0}();\n".format( funcName );
         }
      }
   }

   fs.writeFileSync('test.js', content, "utf8");
}

function generateArgCombinations (functionConstraint) {
   var params = functionConstraint.params;
   var constraints = functionConstraint.constraints;
   var paramToValues = {};
   for (var i = 0; i < params.length; i++ )
   {
      paramToValues[params[i]] = [];
   }
   for(var i = 0; i < constraints.length; i++)
   {
      paramToValues[constraints[i].ident].push(constraints[i].value);
   }
   for (var i = 0; i < params.length; i++ )
   {
      if(paramToValues[params[i]].length == 0) paramToValues[params[i]] = ['\'\''];
   }

   var combinations = paramToValues[params[0]];
   for (var i = 1; i < params.length; i++)
   {
      var len = combinations.length;
      for(var x = 0; x < len; x++) {
         var currArgs = combinations.shift();
         for(var j = 0; j < paramToValues[params[i]].length; j++) {
            combinations.push(currArgs + ', ' + paramToValues[params[i]][j]);       
         }
      }
   }

   return combinations;
}

function constraints(filePath)
{
   var buf = fs.readFileSync(filePath, "utf8");
   var result = esprima.parse(buf, options);

   traverse(result, function (node) 
   {
      if (node.type === 'FunctionDeclaration') {
         var funcName = functionName(node);
         //console.log("Line : {0} Function: {1}".format(node.loc.start.line, funcName ));
         var params = node.params.map(function(p) { return p.name; });
         functionConstraints[funcName] = {constraints:[], params: params};
         traverse(node, function(child) {
            if(child.type == 'VariableDeclarator' && child.init.type == 'MemberExpression') {
               if(child.init.property.name == 'length' && params.indexOf(child.init.object.name) > -1) {
                  functionConstraints[funcName].constraints.push( 
                     new Constraint(
                     {
                        ident: child.init.object.name,
                        value: '""',
                        funcName: funcName,
                        kind: "string"
                     })
                  );

                  functionConstraints[funcName].constraints.push( 
                     new Constraint(
                     {
                        ident: child.init.object.name,
                        value: '"1234567890"',
                        funcName: funcName,
                        kind: "string"
                     })
                  );
               }
            } else if(child.type === 'BinaryExpression') {
               if( child.left.type == "CallExpression" && child.left.callee.property.name =="indexOf" ) {
                  functionConstraints[funcName].constraints.push( 
                     new Constraint(
                     {
                        ident: child.left.callee.object.name,
                        value: child.left.arguments[0].raw,
                        funcName: funcName,
                        kind: "string"
                     })
                  );
                  functionConstraints[funcName].constraints.push( 
                     new Constraint(
                     {
                        ident: child.left.callee.object.name,
                        value: '"_' + child.left.arguments[0].value + '"',
                        funcName: funcName,
                        kind: "string"
                     })
                  );
               }

               if( (child.operator == "==" || child.operator == "===" ||
                     child.operator == "!=" || child.operator == "!==") && child.left.type == 'Identifier' ) {
                  if(params.indexOf( child.left.name ) > -1) {
                     var rightHand = buf.substring(child.right.range[0], child.right.range[1]);
                     functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                           ident: child.left.name,
                           value: rightHand,
                           funcName: funcName,
                           kind: "object"
                        })
                     );

                     var neqVal;
                     if(rightHand == 'undefined' || rightHand == 'null') neqVal = 1;
                     else if(rightHand == 'true') neqVal = 'false';
                     else if(rightHand == 'false') neqVal = 'true';
                     else if(rightHand.startsWith('"') || rightHand.startsWith("'")) {
                        neqVal = '"_' + child.right.value + '"';
                     } else {
                        if(!Number.isNaN(parseFloat(rightHand)) && Number.isFinite(rightHand)) {
                           neqVal = parseFloat(rightHand) + 1;
                        } else {
                           neqVal = 1;
                        }
                     }
                     functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                           ident: child.left.name,
                           value: neqVal,
                           funcName: funcName,
                           kind: "object"
                        })
                     );
                  } else if(child.left.name.indexOf("area") > -1 && params.indexOf("phoneNumber") > -1) {
                     functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                           ident: "phoneNumber",
                           value: '"' + child.right.value + '1234567' + '"',
                           funcName: funcName,
                           kind: "string"
                        })
                     );

                     functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                           ident: "phoneNumber",
                           value: '"___1234567"',
                           funcName: funcName,
                           kind: "string"
                        })
                     );
                  }
               } else if( child.operator == ">" || child.operator == ">=" ||
                          child.operator == "<" || child.operator == "<=" ) {
                  if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1 ) {
                     var rightHand = buf.substring(child.right.range[0], child.right.range[1]);
                     functionConstraints[funcName].constraints.push(
                        new Constraint(
                        {
                           ident: child.left.name,
                           value: createConcreteIntegerValue(true, rightHand),
                           funcName: funcName,
                           kind: "integer"
                        })
                     );
                     functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                           ident: child.left.name,
                           value: createConcreteIntegerValue(false, rightHand),
                           funcName: funcName,
                           kind: "integer"
                        })
                     );
                  }
               }
            } else if(child.type == "CallExpression") {
               if( child.callee.property && child.callee.property.name =="readFileSync" ) {
                  if( params.indexOf(child.arguments[0].name) > -1 ) {
                     functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                           ident: child.arguments[0].name,
                           value:  "'notEmpty/notEmpty'",
                           funcName: funcName,
                           kind: "mockFs"
                        })
                     );

                     functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                           ident: child.arguments[0].name,
                           value:  "'notEmpty/empty'",
                           funcName: funcName,
                           kind: "mockFs"
                        })
                     );

                     functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                           ident: child.arguments[0].name,
                           value:  "'notExist'",
                           funcName: funcName,
                           kind: "mockFs"
                        })
                     );
                  }
               } else if( child.callee.property && child.callee.property.name =="readdirSync") {
                  if( params.indexOf(child.arguments[0].name) > -1 ) {
                     functionConstraints[funcName].constraints.push(
                        new Constraint(
                        {
                           ident: child.arguments[0].name,
                           value:  "'empty'",
                           funcName: funcName,
                           kind: "mockFs"
                        })
                     );

                     functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                           ident: child.arguments[0].name,
                           value:  "'notEmpty'",
                           funcName: funcName,
                           kind: "mockFs"
                        })
                     );

                     functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                           ident: child.arguments[0].name,
                           value:  "'notExist'",
                           funcName: funcName,
                           kind: "mockFs"
                        })
                     );
                  }
               }
            } else if(child.type == "IfStatement" && child.test.type == "LogicalExpression") {
               var left = child.test.left;
               var right = child.test.right;
               if(left.type == 'UnaryExpression') left = left.argument;
               if(right.type == 'UnaryExpression') right = right.argument;
               
               if(left.type == 'MemberExpression') {
                  addMemberExpressionConstrains(funcName, params,
                                                functionConstraints[funcName].constraints,
                                                left.object.name,
                                                left.property.name);
               } else if(left.type == 'Identifier') {
                  addIfIdentifierConstrains(funcName, params,
                                            functionConstraints[funcName].constraints,
                                            left.name);
               }

               if(right.type == 'MemberExpression') {
                  addMemberExpressionConstrains(funcName, params,
                                                functionConstraints[funcName].constraints,
                                                right.object.name,
                                                right.property.name);
               } else if(right.type == 'Identifier') {
                  addIfIdentifierConstrains(funcName, params,
                                            functionConstraints[funcName].constraints,
                                            right.name);
               }
            }
         });
         //console.log( functionConstraints[funcName]);
      }
   });
}

function addIfIdentifierConstrains(funcName, params, constraints, name) {
   if(params.indexOf(name) > -1) {
      constraints.push(
         new Constraint({
            ident: name,
            value:  'undefined',
            funcName: funcName,
            kind: "object"
         })
      );
      constraints.push(
         new Constraint({
            ident: name,
            value:  '{}',
            funcName: funcName,
            kind: "object"
         })
      );
   }
}

function addMemberExpressionConstrains(funcName, params, constraints, name, property) {
   if(params.indexOf(name) > -1) {
      constraints.push(
         new Constraint({
            ident: name,
            value:  '{' + property + ': true' + '}',
            funcName: funcName,
            kind: "object"
         })
      );
      constraints.push(
         new Constraint({
            ident: name,
            value:  '{' + property + ': false' + '}',
            funcName: funcName,
            kind: "object"
         })
      );
   }
}

function traverse(object, visitor) 
{
   var key, child;
   visitor.call(null, object);
   for (key in object) {
      if (object.hasOwnProperty(key)) {
         child = object[key];
         if (typeof child === 'object' && child !== null) {
            traverse(child, visitor);
         }
      }
   }
}

function traverseWithCancel(object, visitor)
{
   var key, child;
   if( visitor.call(null, object) ) {
      for (key in object) {
         if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
               traverseWithCancel(child, visitor);
            }
         }
      }
   }
}

function functionName( node )
{
   if( node.id ) {
      return node.id.name;
   }
   return "";
}


if (!String.prototype.format) {
   String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) { 
         return typeof args[number] != 'undefined'
            ? args[number]
            : match
         ;
      });
   };
}

main();
