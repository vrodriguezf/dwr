var _ = require('lodash');
var Camera = require('../payload/Camera');
var Constants = require('../Constants');
var ControlModes = require('../controlModule/ControlModes');
var DRM = require('../drm/DRM');
var DroneStatus = require('./DroneStatus');
var Formulas = require('../utils/Formulas');
var FuelIncident = projRequire('/incidents/FuelIncident');
var GameplayLogger = require('../logger/GameplayLogger');
var GameplayUtils = require('../GameplayUtils');
var Helpers = require('../utils/helpers');
var LogLevels = require('../logger/LogLevels');
var Radar = require('../payload/Radar');
var SnapshotCauses = require('../../shared/snapshotCauses');
var Waypoint = require('./Waypoint');

/***********************************************
* DRONE CLASS
***********************************************/
const 	DEFAULT_TYPE = 0,
		DEFAULT_NAME = "DRONE",
		DEFAULT_POSITION = {x:0,y:0},
		DEFAULT_ALTITUDE = 2,	//km
		DEFAULT_MIN_ALTITUDE = 0.3,
		DEFAULT_MAX_ALTITUDE = 10,
		DEFAULT_ROTATION = -1*(Math.PI/2),
		DEFAULT_MIN_SPEED = 90,
		DEFAULT_MAX_SPEED = 120,
		DEFAULT_SPEED = 90,				//Km/h
		DEFAULT_COMMUNICATION_RANGE = 200, //km
		DEFAULT_FUEL_CAPACITY = 230,	// L
		DEFAULT_FUEL_CONSUMPTION = 0.15; // L/km?

const WAYPOINT_REACHING_THRESHOLD = 0.001;	//1 m

//CONSTRUCTOR
function Drone(id,gameplayId,initData) {

	this.id = id;
	this.gameplayId = gameplayId;

	this.type = (initData && initData.type)
		?	initData.type
		: 	DEFAULT_TYPE;

	this.position = (initData && initData.position)
		?	initData.position
		: 	DEFAULT_POSITION;

	this.altitude = (initData && initData.altitude) 
		?	initData.altitude
		: 	DEFAULT_ALTITUDE;

	this.minAltitude = (initData && initData.minAltitude) 
		?	initData.minAltitude
		: 	DEFAULT_MIN_ALTITUDE;

	this.maxAltitude = (initData && initData.maxAltitude) 
		?	initData.maxAltitude
		: 	DEFAULT_MAX_ALTITUDE;	

	this.rotation = DEFAULT_ROTATION;

	this.minSpeed = (initData && initData.minSpeed)
		?	initData.minSpeed
		: 	DEFAULT_MIN_SPEED;

	this.maxSpeed = (initData && initData.maxSpeed)
		?	initData.maxSpeed
		: 	DEFAULT_MAX_SPEED;

	this.speed = DEFAULT_SPEED;

	this.communicationRange = (initData && initData.communicationRange)
		?	initData.communicationRange
		: 	DEFAULT_COMMUNICATION_RANGE; 

	//Name
	this.name = (initData && initData.name)
		? initData.name
		: (DEFAULT_NAME + '-' + id);

	//Fuel
	this.fuelCapacity = (initData && initData.fuelCapacity)
		? initData.fuelCapacity
		: DEFAULT_FUEL_CAPACITY;

	this.fuelConsumption = (initData && initData.fuelConsumption)
		? initData.fuelConsumption
		: DEFAULT_FUEL_CONSUMPTION;

	this.remainingFuel = (initData && initData.fuel)
		?	initData.fuel
		: 	this.fuelCapacity;

	//Waypoints
	this.waypointCounter = 0;
	this.waypoints = [];
	this.nextWaypoint = null;		 

	//Drone payload (Array of payload elements)
	this.payload = [];

	//Current task in execution
	this.currentTask = null;

	//Drone status
	this.status = DroneStatus.CRUISE;

	//Fuel alert
	this.fuelAlert = false;
}

Drone.prototype.setAirport = function(airport) {
	this.airport = airport;

	if (airport && airport.position && airport.position.x != null && airport.position.y != null) {
		this.position = {
			x: airport.position.x,
			y: airport.position.y
		}
		//this.position.x = airport.position.x;
		//this.position.y = airport.position.y;
	}
}

Drone.prototype.addPayloadElement = function (payloadElement) {

	if (payloadElement instanceof Camera) {
		//If it's a camera, we calculate the surface focus ratio
		payloadElement.surfaceFocusRatio = Formulas.getCameraFocalizedRatio(payloadElement,this.altitude);
	}

	this.payload.push(payloadElement);
}

/**
* Move the Drone (depending on speed, position, rotation...)
* Returns the distance travelled by the drone
*
*/
Drone.prototype.move = function (gameTime) {

	//Only move the this if it has a waypoint defined
	if (this.waypoints.length == 0) {
		return 0;
	}

	//Check if the first waypoint has 
	if (this.nextWaypoint == null || this.nextWaypoint!=this.waypoints[0]) {
		//If there's no next waypoint, choose the first in the list
		this.nextWaypoint = this.waypoints[0];
	}

	//Change the rotation of the drone to go to that point TODO: Optimize
	this.rotation = Math.atan2(this.nextWaypoint.y - this.position.y,
							this.nextWaypoint.x - this.position.x);	

	var distanceTravelled = Helpers.getDistanceTravelled(this.speed, gameTime.simulationElapsedTime);

	var xMovement = Helpers.round(this.position.x + Helpers.round(Math.cos(this.rotation)*distanceTravelled));
	var yMovement = Helpers.round(this.position.y + Helpers.round(Math.sin(this.rotation)*distanceTravelled));

	//Check if we are going to reach our way-point in this movement
	var wayPointReached = false;

	//TODO: Check efficiency?
	var currentDistanceToWaypoint = Helpers.getDistanceBetween(this.position,this.nextWaypoint);
	var nextDistanceToWaypoint = Helpers.getDistanceBetween({x: xMovement,y: yMovement}, this.nextWaypoint);

	//If the drone gets further from the waypoint is because it's going to reach it
	if (currentDistanceToWaypoint < nextDistanceToWaypoint) {
		wayPointReached = true;
	}

	//Waypoint reached (IMPORTANT!!!) -> this changes the gameplay control mode
	if (wayPointReached) {
		//TODO : Esto es necesario?!!??! Rompe con la velocidad del dron realmente....
		this.position.x = this.nextWaypoint.x;
		this.position.y = this.nextWaypoint.y;

		//Register the event (Log + DRM snapshot)
		GameplayLogger.get(this.gameplayId).log('Drone ' + this.id + ' has reached the waypoint (' + this.nextWaypoint.x + ',' + this.nextWaypoint.y + ')');
		DRM.get(this.gameplayId).takeSimulationSnapshot(SnapshotCauses.DRONE_REACH_WAYPOINT,{
			droneId: this.id,
			waypoint : this.nextWaypoint
		});

		//Changes the control mode to 'MONITORING'
		GameplayUtils.get(this.gameplayId).setControlMode(ControlModes.MONITORING,{caller : this});

		//Execute the task associated with the waypoint TODO: Recheck this
		if (this.nextWaypoint.task != null) {
			this.nextWaypoint.triggerTask(this,gameTime);
		}
		else {
			//Delete wayPoint (and automatically go to the next)
			this.waypoints.shift();
		}
	} else {
		this.position.x = xMovement;
		this.position.y = yMovement;
	}

	return distanceTravelled;

}

//Creates (but not add to the path) a new waypoint associated to this drone
Drone.prototype.createWaypoint = function (x,y, opts) {
	return new Waypoint(this.id + this.waypointCounter++,this.gameplayId,x,y,opts);
}

//Add a waypoint to this drone to an specific index
Drone.prototype.addWaypoint = function (x,y,index,opts) {

	//TODO: Check if the index is valid 
	var newWaypoint = this.createWaypoint(x,y,opts);

	this.waypoints = _.first(this.waypoints,index).concat([newWaypoint]).concat(_.rest(this.waypoints,index));
};

// Append a waypoint to the end of the path
Drone.prototype.appendWaypoint = function(position,opts) {
	//index = last in the path
	var index = this.waypoints.length;
	return this.addWaypoint(position.x,position.y,index,opts);
};

/**
* Set a waypoint as selected or unselected. the rest of the watypoints will be set as unselected 
* NOTE: This is only used in human control mode (Not IA-mode)
**/
Drone.prototype.setWaypointSelection = function (waypointId, selected) {

	for (var i=0; i<this.waypoints.length;i++) {
		if (this.waypoints[i].id == waypointId) {
			this.waypoints[i].selected = selected;
		}
		else {
			this.waypoints[i].selected = false;
		}
	}
}

/**
* Modify a waypoint 
* Returns a pointer to the waypoint changed if the waypoint was succesfully changed. 
* Returns null if the waypoint to change doesn't exists, or if it can be changed
**/
Drone.prototype.setWaypoint = function (waypointId,newWaypoint) {
	var waypointToChange = Helpers.getById(this.waypoints,waypointId);

	if (!waypointToChange) {
		return null;
	}
	else {
		// Changes the waypoint parameters

		//position--Only changeable by
		if (waypointToChange.type == 'refueling' || waypointToChange.type == 'land') {
			GameplayLogger.get(this.gameplayId).log('Only route waypoints can be repositioned',LogLevels.DEBUG);
		} else {
			waypointToChange.x = newWaypoint.x;
			waypointToChange.y = newWaypoint.y;			
		}

		//Selected
		if (newWaypoint.selected != null) {
			waypointToChange.selected = newWaypoint.selected; 			
		}
	}

	return waypointToChange;
}

/**
* Set a path in drone as a list of waypoints
* Matain the waypoints already set, create new ones if needed
**/
Drone.prototype.setPath = function (path) {
	if (!path || !(path instanceof Array)) {
		return;
	}

	var newPath = [];

	var auxWaypoint = null;
	for (var i=0; i<path.length; i++) {
		//Check if the waypoint is already in the drone's path
		auxWaypoint = this.setWaypoint(path[i].id,path[i]);

		if (auxWaypoint != null) {
			newPath[i] = auxWaypoint;
		}
		else {
			newPath[i] = this.createWaypoint(path[i].x, path[i].y,path[i]);
		}
	}

	this.waypoints = newPath;
	this.nextWaypoint = null;

}

Drone.prototype.update = function (gameTime) {

	if (this.status == DroneStatus.DEAD) {
		return;
	}

	//Save the position of the drone
	var lastPosition = {
		x : this.position.x,
		y : this.position.y
	};

	//Move the drone and get the returned distance travelled
	var distanceTravelled = this.move(gameTime);

	//Update payload elements
	for (var i=0; i<this.payload.length; i++) {
		if (this.payload[i] instanceof Camera) {
			var camera = this.payload[i];
			camera.surfaceFocusRatio = Formulas.getCameraFocalizedRatio(camera,this.altitude);
		}
		else if (this.payload[i] instanceof Radar) {
			var radar = this.payload[i];
			radar.position = this.position;
		}
	}	

	//Update the current task
	if (this.currentTask!=null) {
		this.currentTask.update(this,gameTime);
	}

	//Consume fuel depending on the distance travelled
	if (this.status != DroneStatus.REFUELING) {
		//this.remainingFuel = Helpers.round(this.remainingFuel - distanceTravelled*this.fuelConsumption);
		this.remainingFuel -= (distanceTravelled*this.fuelConsumption);

		//Check if the drone is running out of fuel. In this case, create a new incident now to notify it
		//Note : The Incident ID is given by the gameplay module
		if (this.remainingFuel <= Constants.incidents.fuel.threshold && !this.fuelAlert) {
			GameplayUtils.get(this.gameplayId).addNewIncident(new FuelIncident(null,this.gameplayId,gameTime.simulationTotal,this,{
				message : 'Drone ' + this.id + ' : combustible bajo'
			}));

		}

	}
}

Drone.prototype.detect = function(x,y) {
	for (var i=0; i<this.payload.length; i++) {
		if (this.payload[i] instanceof Radar) {
			if (this.payload[i].detect(x,y)) {
				return true;
			}
		}
	}

	return false;
}

Drone.prototype.addFuelCharge = function (fuelCharge) {
	this.remainingFuel = ((this.remainingFuel + fuelCharge) <= this.fuelCapacity)
		? (this.remainingFuel + fuelCharge)
		: (this.fuelCapacity);

}

Drone.prototype.kill = function () {
	this.status = DroneStatus.DEAD;

	//Register the event (Log + DRM snapshot)
	GameplayLogger.get(this.gameplayId).log('Drone ' + this.id + ' has been destroyed',LogLevels.WARNING);
	DRM.get(this.gameplayId).takeSimulationSnapshot(SnapshotCauses.DRONE_DESTROYED,{
		droneId : this.id
	});	
}

//Exports the class
module.exports = Drone;