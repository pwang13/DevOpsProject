#!/bin/sh
# Refuse to commit files with the string NOCOMMIT, debugger, or merge markers present.
#
echo "Check Commit Script start now"
echo "--------Running Istanbul"
node_modules/.bin/istanbul cover test.js > test.txt
filename='test.txt'
filename1='result.txt'
sed -n '3,6p' "$filename">$filename1
echo "Istanbul Finished"