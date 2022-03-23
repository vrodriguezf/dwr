/************************************
* FUEL INCIDENT
************************************/
var Constants = require('../Constants');
var Drone = projRequire('/drones/Drone');
var Incident = require('./Incident');
var Levels = require('./Levels');

const INCIDENT_TYPE = "FuelIncident";
const DEFAULT_LEVEL = Levels.CAUTION;

function FuelIncident(id,gameplayId,startTime,drone,initData) {

	var level = (initData && initData.level)
		? 	initData.level
		: 	DEFAULT_LEVEL;

	Incident.call(this,id,gameplayId,INCIDENT_TYPE,level,startTime,initData);

	this.drone = drone;
}

//Inheritance
FuelIncident.prototype = Object.create(Incident.prototype);
FuelIncident.prototype.constructor = FuelIncident;

FuelIncident.prototype.start = function (params) {

	Incident.prototype.start.call(this,params);

	this.drone.fuelAlert = true;
}

FuelIncident.prototype.update = function (gameTime) {

	Incident.prototype.update.call(this,gameTime);

	if (this.drone.remainingFuel > Constants.incidents.fuel.threshold) {
		this.finish();
	}
}

FuelIncident.prototype.finish = function () {

	this.drone.fuelAlert = false;

	Incident.prototype.finish.call(this);
}

module.exports = FuelIncident;