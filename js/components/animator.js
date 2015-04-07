var Eases = require('eases')
var Lerp = require('lerp')

var internals = {
	
	updateObjectValue : function( elapsed, prevElapsed, keyframe, action ) {
		
		var t = ( elapsed - keyframe.start ) / keyframe.duration
		
		action.obj[action.key] = Lerp(
			action.values[0]
		  , action.values[1]
		  , keyframe.easing(t)
		)
	},
	
	updateFunctionValue : function( elapsed, prevElapsed, keyframe, action ) {
		
		var t = ( elapsed - keyframe.start ) / keyframe.duration
		
		action.obj[action.key]( Lerp(
			action.values[0]
		  , action.values[1]
		  , keyframe.easing(t)
		))
	},
	
	updateObjectValueOnce : function( elapsed, prevElapsed, keyframe, action ) {
		
		if( keyframe.start >= prevElapsed && keyframe.start < elapsed ) {
			
			action.obj[action.key] = action.values
		}
	},

	updateFunctionOnce : function( elapsed, prevElapsed, keyframe, action ) {
		
		if( keyframe.start >= prevElapsed && keyframe.start < elapsed ) {
			
			action.obj[action.key]( action.values )
		}
	},
	
	updateFn : function( poem, keyframes, maxTime, speed ) {
		
		var prevElapsed = 0
		
		return function(e) {
			
			var elapsed = (e.elapsed / 1000 * speed) % maxTime
			
			for( var i=0; i < keyframes.length; i++ ) {
				var keyframe = keyframes[i]
				
				//Time is in range
				if( elapsed >= keyframe.start && elapsed < keyframe.end ) {
					
					for( var j=0; j < keyframe.actions.length; j++ ) {
						
						var action = keyframe.actions[j]
						action.update( elapsed, prevElapsed, keyframe, action )
					}
				}
			}
			
			prevElapsed = elapsed
		}
	},
	
	easingFn : function( easingProp ) {
		
		var easingName, easingFn
		
		if( !easingProp || _.isString( easingProp ) ) {
			
			easingName = easingProp || "linear"
			easingFn = Eases[ easingName ]
		}
		
		if( _.isFunction( easingProp ) ) {
			
			easingFn = easingProp
			
			if( easingFn(0) !== 0 || easingFn(1) !== 1 ) {
				throw new Error( "poem-animator received an easing function that didn't return a 0 and 1", easingProp )
			}
		}
		
		if( !_.isFunction( easingFn ) ) {
			throw new Error( "poem-animator was not able to find the easing function " + easingProp )
		}
		return easingFn
		
	},
	
	createAction : function( poem, action ) {
		
		// example action: [ "camera.object.position.x", [0, 10] ]
		
		var keyParts = action[0].split('.')
		var path = keyParts.slice(0,keyParts.length - 1)
		var key = _.last(keyParts)
		var values = action[1]
		
		var obj = _.reduce( path, function( memo, pathPart ) {
			
			var nextRef = memo[pathPart]
			if( !_.isObject( nextRef ) ) {
				throw new Error( "poem-animator was not able to create a reference", action )
			}
			return nextRef
		}, poem)
		
		var update
		
		if( _.isFunction( obj[key] ) ) {
			update = _.isArray( values ) ? internals.updateFunctionValue : internals.updateFunctionOnce
		} else {
			//Either update the value with transitions, or just once
			update = _.isArray( values ) ? internals.updateObjectValue : internals.updateObjectValueOnce
		}
		
		return {
			obj : obj,
			key : key,
			values: values,
			update : update
		}
	},
	
	calculateStartEndFn : function() {
		
		var lastEnd = 0
		
		return function( keyframe ) {
			
			var start, end
			
			if( _.isNumber( keyframe.start ) ) {
				start = keyframe.start
				end = start + keyframe.duration
			} else {
				start = lastEnd
				end = start + keyframe.duration
				lastEnd = end
			}
			
			return {
				start: start,
				end: end
			}
		}		
	},
	
	isolateFilter : function( keyframes ) {
		
		var isolate = _.find( keyframes, function( keyframe ) {
			return keyframe.isolate
		})
		
		if( isolate ) {
			return [isolate]
		} else {
			return keyframes
		}
	},
	
	startHereFilter : function( keyframes ) {
		
		var startHere = _.find( keyframes, function( keyframe ) {
			return keyframe.startHere
		})
		
		if( !startHere ) {
			return keyframes
		}
		
		var index = keyframes.indexOf( startHere )
		
		return keyframes.slice(index)
		
	},
	
	processKeyframeConfig : function( poem, keyframes ) {
		
		var startEndCalculator = internals.calculateStartEndFn()
		
		var filters = _.compose(
			internals.isolateFilter,
			internals.startHereFilter
		)
		
		return _.map( filters( keyframes ), function( keyframe ) {
			
			var timing = startEndCalculator( keyframe )
			
			return {
				start       : timing.start
			  , end			: timing.end
			  , duration    : keyframe.duration
			  , easing      : internals.easingFn( keyframe.easing )
			  , actions     : _.map( keyframe.actions, _.partial( internals.createAction, poem ) )
			}
		})
	},
	
	calcMaxTime : function( keyframes, loop ) {
		
		if( loop ) {
			return _.reduce( keyframes, function( memo, keyframe ) {
				return Math.max( memo, keyframe.end )
			}, 0)
		} else {
			return Infinity
		}
	},
}

module.exports = function( poem, properties ) {
	
	var config = _.extend({
		keyframes : []
	  , loop : true
	  , speed : 1
	}, properties)
	
	var keyframes = internals.processKeyframeConfig( poem, config.keyframes )
	var maxTime = internals.calcMaxTime( keyframes, config.loop )
	
	console.log(keyframes)
	poem.emitter.on('update', internals.updateFn( poem, keyframes, maxTime, config.speed ) )
	
	return {}
}