pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null
(cd $SCRIPTPATH/../ &&
  jspm bundle app/app.component --inject &&
  node dist/server.js
)
