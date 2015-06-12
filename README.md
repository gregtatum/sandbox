# Three.js Sandbox

http://gregtatum.com/sandbox/

A sandbox to play around with ideas. It uses [poem-manifests](https://www.npmjs.com/package/poem-manifests), [poem-loop](https://www.npmjs.com/package/poem-loop), and [poem-menu](https://www.npmjs.com/package/poem-menu) to quickly write re-usable 3d code. See the respective module documentation pages to see how the manifests and menus work.

The central poem object is the application graph. If you're looking to get oriented in the code base, the manifests are the individual experiments. They then load in components that get saved to the central poem object.

## Running

Make sure npm is install, then in the directory run `npm install` to get the dependencies.

To run and prototype with live-reload:

	npm start

To build:

	npm run build

Project copyright (c) 2014 Greg Tatum under The MIT License (MIT)
