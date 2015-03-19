# Three.js Sandbox

A sandbox to play around with ideas. It uses [poem-manifests](https://www.npmjs.com/package/poem-manifests), [poem-loop](https://www.npmjs.com/package/poem-loop), and [poem-menu](https://www.npmjs.com/package/poem-menu) to quickly write re-usable 3d code. See the respective module documentation pages to see how the manifests and menus work.

The central poem object is the application graph.

## Running

Currently it uses gulp for building, but will be moving to run scripts exclusively.

To build:

	gulp browserify

To run and prototype:

	npm start

To run and prototype with live-reload

	npm run start:live

Project copyright (c) 2014 Greg Tatum under The MIT License (MIT)
