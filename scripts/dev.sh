pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null
(cd $SCRIPTPATH/../ &&
  jspm unbundle &&
  gulp
)
