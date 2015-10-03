pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null
(cd $SCRIPTPATH/../ &&
  ./scripts/clean.sh && 
  npm i &&
  tsd install &&
  gulp build &&
  jspm i
)
