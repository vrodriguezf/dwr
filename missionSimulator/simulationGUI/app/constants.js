define({
	STAGE_WIDTH: 800,
	STAGE_HEIGHT: 600,
	airport: {
		asset: {
			key: 'airport',
			path: 'assets/img/airport.png'
		},
		sprite: {
			anchor: {
				x: 0.5,
				y: 0.15
			},
			frames : {
				width: 58,
				height: 124
			},
			scale: {
				x: 0.5,
				y: 0.5
			}
		}
	},
	background: {
		zIndex: 0
	},
	camera: {
		speedX : 6,
		speedY : 6
	},
	controlModes : {
		MONITORING : 0,
		ADDING_WAYPOINTS : 1,
		MANUAL : 2
	},
	debug : false,
	drone: {
		asset: {
			key: 'drones',
			path: 'assets/img/drones/barracuda_white.png'
		},
		waypoint: {
			max: 20,
			nextWatpointScaleDelta : 0.2,			
			scale: {
				x: 0.2,
				y: 0.2
			},
			zIndex: 8
		},
		sensor: {
			zIndex: 9
		},
		sprite: {
			scale: {
				x : 0.3,
				y : 0.3
			}
		},
		zIndex : 10
	},
	explosion: {
		asset: {
			key: 'explosion',
			path: 'assets/explosion.png'
		},
		sprite: {
			scale: {
				x: 1.0,
				y: 1.0
			},
			frames: {
				width: 64,
				height: 64
			},
			zIndex: 20
		}

	},
	fuelStation: {
		asset: {
			key: 'fuelStation',
			path: 'assets/fuelStation.png'
		},
		sprite: {
			frames: {
				width: 72,
				height: 95
			},
			scale: {
				x: 0.8,
				y: 0.8
			},
			zIndex: 8			
		}
	},
	gcs: {
		asset : {
			key: 'gcs',
			path : 'assets/img/gcs.png'
		},
		sprite: {
			scale: {
				x: 0.5,
				y: 0.5
			}
		}
	},
	incident: {
		screenMessage: {
			initialStageOffset : {
				x : 10,
				y : 60
			},
			messageHeight : 20,
			distanceBetweenMessages : 5,
			notificationDuration : 300 //seconds
		}
	},
	input : {
		addWayPoint : {
			name : 'waypoint'
		},
		setPath: {
			name: 'setPath'
		},
		selectDrone: {
			name: 'selectDrone'
		}
	},
	scale: {
		pixelsPerKm : 5,
		worldAreaAndStageBoundRelation : 1 	//Area (world) / Area(stage) in pixels
	},
	ship: {
		humanShip : {
			type : 0,
			assetKey: 'humanShip'
		},
		enemyShip : {
			type : 1,
			assetKey: 'enemyShip'
		},
		zIndex: 8
	},
	stage: {
		width: 800,
		height: 600
	},
	waypoint: {
		assetKey: 'waypoint'
	}
});