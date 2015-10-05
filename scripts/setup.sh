pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd`
popd > /dev/null
(cd $SCRIPTPATH/../ &&
  ./scripts/clean.sh && 
  npm i &&
  $(npm bin)/tsd install &&
  gulp build &&
  $(npm bin)/jspm i
)
