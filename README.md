#bk-fullstack-ts

## Synopsis

This is a simple demo how to setup a project that uses TypeScript, Express 4, Angular 2, Sass 3, Gulp 3, jspm, BrowserSync, and nodemon.

For server side live reloading, this project requires [nodemon](https://github.com/remy/nodemon)

## Installation
1. Clone this repository
2. cd into the directory
3. run `npm i`
4. run `tsd install`
4. run `gulp build`
5. run `jspm i`

Alternatively, for Linux based operating systems you can run `./scripts/setup.sh`

This will install your node dependencies, TypeScript definitions, will run an initial build, and will install frontend dependencies. 

## Use bundled mode in production (with bundling, e.g. without http/2)
1. run `jspm bundle app/app.component --inject`
2. run the server with `node dist/server.js`
3. The production server is now listening at `http://localhost:3000`

Alternatively, for Linux based operating systems you can run `./scripts/prod_bundled_server.sh`

This causes jspm to bundle the JavaScript (transpiled from TypeScript) files into a single file,
which significantly reduces the number of http requests and in HTTP 1, initial load time. It is not ideal for dev or HTTP/2.

The `--inject` flag specifically makes sure to inject a script tag pointing to this new bundle into index.html. It is assumed that you have system.js and config.js already in your index.html page since TypeScript does not currently support self executing (sfx) bundling. Due to this limitation, we must call `jspm unbundle` when switching back and forth between bundled and unbundled mode. 

## Use unbundled mode in production (without bundling, e.g. for http/2)
1. run `jspm unbundle` 
2. run the server with `node dist/server.js`
3. The production server is now listening at `http://localhost:3000`

Alternatively, for Linux based operating systems you can run `./scripts/prod_unbundled_server.sh`

This takes any bundle configuration out of config so that multiple files will be used, this is the prefered configuration for http/2.

## Hack the code
1. run `jspm unbundle`
2. run `gulp`

Alternatively, for Linux based operating systems you can run `./scripts/dev.sh`

This causes jspm to unbundle any previous production bundle. This makes development easier because it ensures that only individual files need to be transpiled and built when you change them, and not the whole project.

## Develop with Live Reload
1. run `jspm unbundle`
2. run the server with `nodemon dist/server.js`
3. The live reloading server is listening at `http://localhost:3001` and the
non-live reloading server is still available port 3000.

Alternatively, for Linux based operating systems you can run `./scripts/dev_server.sh`

##Credits

Thank you [@mpint](https://github.com/mpint) for an awesome [pull request](https://github.com/bkinsey808/bk-fullstack-ts/pull/9)
now this project includes support for scss partials, better file conventions, and other fixes.

Thank you [@jimthedev](https://github.com/jimthedev) for an awesome [pull request](https://github.com/bkinsey808/bk-fullstack-ts/pull/2),
now this project includes convenient bash scripts for major dev processes and other fixes.

I would like to give credit to https://github.com/mbalex99/newfamily-example which helped with some ideas.
