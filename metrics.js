var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var fs = require("fs");

var MAX_CONDITIONS = 2;
var MAX_FUNCTION_LINES = 10;
var MAX_NESTED_DEPTH = 1;
var error = false;

function main()
{
  var args = process.argv.slice(2);

  if( args.length == 0 )
  {
    args = ["mystery.js"];
  }
  var filePath = args[0];
  
  complexity(filePath);

  if(error) process.exit(1);
  else process.exit(0);
}

// A function following the Visitor pattern. Provide current node to visit and function that is evaluated at each node.
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

// A function following the Visitor pattern.
// Annotates nodes with parent objects.
function traverseWithParents(object, visitor)
{
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent') 
            {
              child.parent = object;
              traverseWithParents(child, visitor);
            }
        }
    }
}


// A function following the Visitor pattern but allows canceling transversal if visitor returns false.
function traverseWithCancel(object, visitor)
{
    var key, child;

    if( visitor.call(null, object) )
    {
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

function complexity(filePath)
{
  var buf = fs.readFileSync(filePath, "utf8");
  var ast = esprima.parse(buf, options);

  // Tranverse program with a function visitor.
  traverseWithParents(ast, function (node) 
  {
    if (node.type === 'FunctionDeclaration') 
    {
      var funcName = functionName(node);

      var lines = node.loc.end.line - node.loc.start.line + 1;
      if(lines > MAX_FUNCTION_LINES) {
        error = true;
        console.log('Function {0}() has more than {1} lines: {2}'
                      .format(funcName, MAX_FUNCTION_LINES, lines));
      }

      var nestedDepth = 0;
      traverseWithParents(node.body, function(func_child) {
        if(func_child.type == 'IfStatement') {
          var conditions = 1;
          traverseWithParents(func_child.test, function(if_child) {
            if(if_child.type == 'LogicalExpression') conditions++;
          });
          if(conditions > MAX_CONDITIONS) {
            error = true;
            var guiltyTest = buf.substring(func_child.test.range[0], func_child.test.range[1]);
            console.log('{0}(): More than {1} conditions in an IfStatement:\n\t{2}'
                          .format(funcName, MAX_CONDITIONS, guiltyTest));
          }
        }

        if(isDecision(func_child)) {
          var _depth = 1;
          var curr = func_child;
          while(curr.parent) {
            curr = curr.parent;
            if(isDecision(curr)) {
              _depth++;
            }
          }
          if(_depth > nestedDepth) {
            nestedDepth = _depth;
          }
        }
      });

      if(nestedDepth > MAX_NESTED_DEPTH) {
        error = true;
        console.log('{0}(): More than {1} nested levels: {2}'
                      .format(funcName, MAX_NESTED_DEPTH, nestedDepth));
      }
    }
  });
}

// Helper function for counting children of node.
function childrenLength(node)
{
  var key, child;
  var count = 0;
  for (key in node) 
  {
    if (node.hasOwnProperty(key)) 
    {
      child = node[key];
      if (typeof child === 'object' && child !== null && key != 'parent') 
      {
        count++;
      }
    }
  } 
  return count;
}


// Helper function for checking if a node is a "decision type node"
function isDecision(node)
{
  if( node.type == 'IfStatement' )
  {
    // Don't double count else/else if
    if( node.parent && node.parent.type == 'IfStatement' && node.parent["alternate"] )
    {
      return false;
    }
    return true;
  }

  if( node.type == 'ForStatement' || node.type == 'WhileStatement' ||
     node.type == 'ForInStatement' || node.type == 'DoWhileStatement')
  {
    return true;
  }
  return false;
}

// Helper function for printing out function name.
function functionName( node )
{
  if( node.id )
  {
    return node.id.name;
  }
  return "anon function @" + node.loc.start.line;
}

// Helper function for allowing parameterized formatting of strings.
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
