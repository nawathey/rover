f=$(find . -name node_modules -prune -o -name js -prune -o -name \*.js -print)
echo '*** running jslint...'
jslint $f
echo '*** running jshint...'
jshint $f
