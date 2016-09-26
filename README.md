# DevOpsProject
**Trigger Build**<br>
The build is triggered by the post-receive hook of the Github. Once a push is made to the Github, the Github will send a HTTP request to the build-server on AWS. The build server will parse the HTTP request to obtain the URL to the Repo and the corresponding branch name.
<br>
**Dependency Management and Build Script Execution**<br>
We write a shellscript to build the job and the dependency management for the build job is achieved with maven. The shell script for this can be found here in this repo.<br>
**D**
