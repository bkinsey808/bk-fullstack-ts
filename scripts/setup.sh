pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null
(cd $SCRIPTPATH/../ && 
  npm i &&
  tsd install &&
  gulp build &&
  jspm i
)
