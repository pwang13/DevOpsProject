//Lets require/import the HTTP module
var http = require('http');
var fs = require('fs');

//Lets define a port we want to listen to
const PORT=8080;

//We need a function which handles requests and send response
function handleRequest(request, response){
    response.end('Building: ' + request.url);
}

//Create a server
var server = http.createServer(handleRequest);
var exec = require('child_process').exec;

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

function handleRequest(request, response)
{
	console.log("Request received");

	if (request.method == 'POST') {
        	var body = '';

	        request.on('data', function (data) {
        		body += data;
        	});

	        request.on('end', function () {
			var post = JSON.parse(body);
			var branch = post.ref.split("/")[2];
			var cmd = 'docker run -v /home/ubuntu/DevOpsProject/:/vol builddocker sh /vol/build.sh ' + branch;
			var child = exec(cmd, {maxBuffer: 1024 * 5000}, function(error, stdout, stderr) 
        		{
				var stdoutLines = stdout.split('\n');
				var output = '\n##################################\n';
				output += '# BUILDING BRANCH: ' + branch + '\n';
				output += '##################################\n';
				for(var i = 0; i < stdoutLines.length; i++) {
					if(stdoutLines[i].lastIndexOf('[INFO]', 0) === 0)
						output += stdoutLines[i] + '\n';
				}
				
				fs.appendFile('log.txt', output, function (err) {
					if (err) console.log(err);
					else console.log('Log saved!');
				});
				if(error){
					var cmdMail = 'echo "Building status" | mail -s "Build Fail" glingna@ncsu.edu';
					exec(cmdMail, {maxBuffer: 1024 * 5000}, function(error, stdout, stderr){}); 
				}else{
					var cmdMail = 'echo "Building status" | mail -s "Build Success" glingna@ncsu.edu';
					exec(cmdMail, {maxBuffer: 1024 * 5000}, function(error, stdout, stderr){}); 
				}
        		});

	        	child.on('exit', function()
		        {
        		    console.log('built');
		            return true;
        		});
	
        	});
		response.end('');
    	} else {
		var logStream = fs.createReadStream('log.txt');
		logStream.pipe(response);
	}
}

