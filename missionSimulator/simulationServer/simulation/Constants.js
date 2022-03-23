module.exports = {
	DRM: {
		cacheFlushInterval : 10000, //ms
		dataEventName : 'DRM-Data'
	},
	input : {
		addWaypoint : {
			name: 'addWaypoint'
		},
		setPath: {
			name: 'setPath'
		},
		selectDrone: {
			name: 'selectDrone'
		},
		setSpeed: {
			name: 'setSpeed'
		}
	},
	gameTime: {
		timeBetweenUpdates : 50
	},
	decimalPrecisionNumber : 5,
	incidents : {
		fuel : {
			threshold : 50 // L
		}
	},
	payload : {
		camera : {
			typeName : 'camera'
		},
		radar: {
			typeName : 'radar',
			defaultRatio : 60	//km
		}
	},
	refueling : {
		defaultRefuelingDuration: 20	//seconds
	},
	ship: {
		minTimeBetweenVisibilityChanges : 20000, //milliseconds in Playing time (Not simulation time)
		maxTimeBetweenVisibilityChanges	: 30000, //milliseconds in playing time (Not simulation time)
		visibilityThreshold : 1	// (value <= visibilityThreshold) -> Not visible ; (value > visibilityThreshold) ->  Visible	
	}
}