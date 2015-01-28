require('./utils/ThreeConsole');

var manifests = require('../manifests');

var routing = require('./core/routing');
var ui = require('./core/ui')( manifests );

routing.start(
	require('./core/poem'),
	manifests
);