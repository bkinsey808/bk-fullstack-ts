#bk-fullstack-ts

## Synopsis

This is a simple demo how to setup a project that uses Express 4, Angular 2, Sass 3, Gulp 3, jspm, and TypeScript

## Installation

1. Clone this repository
2. cd into the directory
3. run `npm i`
4. run `tsd install`
4. run `gulp build`
5. run `jspm i`

## Run the Server
1. run the server with `node dist/server.js`
2. The server is listening by default on `http://localhost:3000`

## Deploy into production
1. run `jspm bundle components/app --inject`

## Hack the code
1. run `jspm unbundle`
2. run `gulp`

I would like to give credit to https://github.com/mbalex99/newfamily-example which helped with some ideas.
