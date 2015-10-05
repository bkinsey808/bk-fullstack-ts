pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null
(cd $SCRIPTPATH/../ &&
  $(npm bin)/jspm unbundle &&
  node dist/server.js
)
