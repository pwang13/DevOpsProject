#!/bin/bash/
./bin/run.sh pmd -d ./mystery.js -R ./bin/ecmascript/basic.xml > PMD_Report.txt
./bin/run.sh pmd -d ./mystery.js -R ./bin/ecmascript/braces.xml >> PMD_Report.txt
./bin/run.sh pmd -d ./mystery.js -R ./bin/ecmascript/controversial.xml >> PMD_Report.txt
