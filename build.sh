git clone -b $1 https://github.com/pwang13/JSPDemo.git
cd JSPDemo
mvn compile -DskipTests -Dmaven.javadoc.skip=true
