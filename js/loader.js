// state variables
var currentManifest = null;
var currentPoem = null;

// dependencies
var poem = null;		//injected
var manifests = null;	//injected

var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var createLoader = require('poem-manifests');
var loader = null;

var loaderExports = {
	
	//inject the poem and manifests to avoid circular references to the loader
	init : function( poemFunction, manifestsObject ) {
		
		poem = poemFunction;
		manifests = manifestsObject;
		
		loader = createLoader( manifests, {
			emitter : emitter,
			getGraph : function( manifest, slug ) {	return poem( manifest, loader.emitter ); },
			globalManifest : {}
		});
		
		loader.emitter.on('load', function( e ) {
			window.poem = e.graph;
		});
		
	},
	
	load : function( slug ) {
		return loader.load( slug );
	},
	
	emitter : emitter
	
};

module.exports = loaderExports;
