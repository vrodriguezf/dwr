/************************************
* PAYLOAD INCIDENT : Disable all the drone payload elements!!!!!!
************************************/
var Incident = require('./Incident');
var Levels = require('./Levels');

const INCIDENT_TYPE = "PayloadIncident";
const DEFAULT_LEVEL = Levels.CAUTION;

	function PayloadIncident(id,gameplayId,startTime,drone,initData) {

		var level = (initData && initData.level)
			? 	initData.level
			: 	DEFAULT_LEVEL;

	initData.message = (initData && initData.message)
		?	'Drone ' + drone.id + ' : ' + initData.message
		: 	'Drone ' + drone.id + ' : ' + 'Se han detectado problemas en los sensores';

	Incident.call(this,id,gameplayId,INCIDENT_TYPE,level,startTime,initData);

	//Sub-fields
	this.endTime = (initData && initData.endTime)
		?	initData.endTime
		: 	null;	

	this.drone = drone;
}

//Inheritance
PayloadIncident.prototype = Object.create(Incident.prototype);
PayloadIncident.prototype.constructor = PayloadIncident;

PayloadIncident.prototype.start = function (params) {

	//Disable all the drone payloiad elements
	for (var i=0; i<this.drone.payload.length; i++) {
		this.drone.payload[i].disable();
	}

	Incident.prototype.start.call(this,params);
};

PayloadIncident.prototype.update = function (gameTime) {

	//If the first payload element is enabled, all of them are enabled too
	if (this.drone.payload.length != 0 && this.drone.payload[0].enabled) {
		this.finish();
	}

	Incident.prototype.update.call(this,gameTime);
}

PayloadIncident.prototype.finish = function () {

	//Re-enable all the drone payload elements
	for (var i=0; i<this.drone.payload.length; i++) {
		this.drone.payload[i].enable();
	}

	Incident.prototype.finish.call(this);
}

module.exports = PayloadIncident;