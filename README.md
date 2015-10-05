#bk-fullstack-ts

## Synopsis

This is a simple demo how to setup a project that uses Express 4, Angular 2, Sass 3, Gulp 3, jspm, and TypeScript

## Installation

For server side live reloading, this project requires (nodemon)[https://github.com/remy/nodemon]

1. Clone this repository
2. cd into the directory
3. run `npm i`
4. run `tsd install`
4. run `gulp build`
5. run `jspm i`

Alternatively, for Linux based operating systems you can run `./scripts/setup.sh`

## Deploy into production (with bundling)
1. run `jspm bundle app/app.component --inject`
2. run the server with `node dist/server.js`
3. The server is listening by default on `http://localhost:3000`

This causes jspm to bundle the JavaScript (transpiled TypeScript) files into a single file,
which significantly reduces the number of http requests, and initial load time, but is no good for dev.

## Deploy into production (without bundling, e.g. for http/2)
1. run `jspm unbundle`
2. run the server with `node dist/server.js`
3. The server is listening by default on `http://localhost:3000`

Alternatively, for Linux based operating systems you can run `./scripts/prod_unbundled_server.sh`

## Hack the code
1. run `jspm unbundle`
2. run `gulp`

Alternatively, for Linux based operating systems you can run `./scripts/dev.sh`

This causes jspm to unbundle, which makes hacking the code (developing) easier because
only individual files need to be transpiled and built, and not the whole project.

## Run dev server
1. run the server with `nodemon dist/server.js`
2. The live reloading server is listening by default on `http://localhost:3001` and the
non-live reloading server is still available port 3000.

Alternatively, for Linux based operating systems you can run `./scripts/hack.sh`

##Credits

Thank you [@mpint](https://github.com/mpint) for an awesome [pull request](https://github.com/bkinsey808/bk-fullstack-ts/pull/9)
now this project includes support for scss partials, better file conventions, and other fixes.

Thank you [@jimthedev](https://github.com/jimthedev) for an awesome [pull request](https://github.com/bkinsey808/bk-fullstack-ts/pull/2),
now this project includes convenient bash scripts for major dev processes and other fixes.

I would like to give credit to https://github.com/mbalex99/newfamily-example which helped with some ideas.
