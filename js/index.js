require('./utils/ThreeConsole');

var routing = require('./routing');
var ui = require('./ui');

routing.start(
	require('./Poem'),
	require('./levels')
);