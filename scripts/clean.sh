pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null
(cd $SCRIPTPATH/../ &&
  rm -rf node_modules && 
  rm -rf dist &&
  rm -rf typings
)