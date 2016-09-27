# DevOpsProject
**Trigger Build**<br>
The build is triggered by the post-receive hook of the Github. Once a push is made to the Github, the Github will send a request to the build-server on AWS. The build server will parse the request to obtain the Repo address and the corresponding branch name.<br>

**Dependency Management and Build Script Execution**<br>
We write a shellscript to build the job and the dependency management for the build job is achieved with maven. The shell script for this can be found here in this repo.<br>

**Build Status and post-build task**<br>
As we are using maven to build this job, any error with the build will write to stderr. This allows us to judge the success or failure of the build by detecting if there's any information in the stderr. We will send out an email to notify the user the build status. This is done by mail-utility provided by the unix system.<br>

**Multiple Branches, Multiple Jobs**<br>
The branch name is contained in the request to trigger the build, so we are able to clone codes from different branch of a Github Repo. We configure a docker image for the build-server, and for each build job, we use a new container to ensure a clean build.<br>

**Build History and Display over HTTP**<br>
The output by the maven will be stored in a textfile. The information regarding to each build will be append that text file. The content of this text-file will be directed to http requests made to the build server.<br>

**Snapshots**
GitHub Hooks to trigger the build:<br>
![Git Hooks](https://github.ncsu.edu/tthai/DevOpsProject/blob/master/SnapShot1.png)<br>
Display build status over HTTP, with build tasks for different branches:<br>
![Display HTTPS](https://github.ncsu.edu/tthai/DevOpsProject/blob/master/SnapShot2.png)<br>
Email Notification<br>
![Email Notification](https://github.ncsu.edu/tthai/DevOpsProject/blob/master/SnapShot3.png)
