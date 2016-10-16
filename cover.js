var fs = require('fs');

fs.readFile('test.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  // console.log(data);
  lines = data.split("\n");
  // console.log(lines[1]);
  // console.log(lines);
  for (var i in lines) {

  		// console.log(lines[i]);
  	if (lines[i].includes("Statement")) {
  		var j = lines[i].indexOf(':');
  		var k = lines[i].indexOf('%');
  		// console.log(lines[i]);
  		// console.log(j);
  		var n = parseFloat(lines[i].substring(j + 1,k));
  		// console.log(n >110);
  		if ( n < 90) {
  			process.exit(1);
  		}
  	}
  }
});