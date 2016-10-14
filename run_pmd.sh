#!/bin/bash/
./bin/run.sh pmd -d ./mystery.js -R ./bin/ecmascript/basic.xml > PMD_Report.txt
./bin/run.sh pmd -d ./mystery.js -R ./bin/ecmascript/braces.xml >> PMD_Report.txt
./bin/run.sh pmd -d ./mystery.js -R ./bin/ecmascript/controversial.xml >> PMD_Report.txt
error_num=`wc -l PMD_Report.txt`
SUBSTRING=$(echo $error_num| cut -d ' ' -f 1)
SUBSTRING+=" Issues"
echo $SUBSTRING >> PMD_Report.txt
