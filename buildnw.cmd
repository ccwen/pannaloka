browserify --bare -x react -x react/addons  -t [reactify --es6 ] src/index.js > dist\bundle.js
@REM browserify -t [reactify --es6 ] -t es6ify src/index.js | uglifyjs > dist\bundle.js