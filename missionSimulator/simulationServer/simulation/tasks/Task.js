/****************
* TASK CLASS
*****************/
var DRM = require('../drm/DRM');
var GameplayLogger = require('../logger/GameplayLogger');
var SnapshotCauses = require('../../shared/snapshotCauses');

const 	NOT_STARTED = 0,
		EXECUTING = 1,
		FINISHED = 2;

function Task(id,gameplayId,type,initData) {
	this.id = id;
	this.gameplayId = gameplayId;
	this.type = type;

	this.plannedStartTime = (initData && initData.plannedStartTime)
		?	initData.plannedStartTime
		: 	null;

	this.plannedDuration = (initData && initData.plannedDuration) 
		? 	initData.plannedDuration 
		: 	null;

	this.plannedEndTime = (initData && initData.plannedEndTime)
		?	initData.plannedEndTime
		: 	null;

	this.status = NOT_STARTED;

	this.simulationStartTime = null;
	this.simulationEndTime = null;
	this.simulationDuration = null; //Seconds
}

//@Override DON'T READ WAYPOINTS
Task.prototype.start = function(drone,gameTime) {

	this.status = EXECUTING;
	this.simulationStartTime = gameTime.simulationTotal;

	if (drone) {
		drone.currentTask = this;		
	}

	//Register this event
	DRM.get(this.gameplayId).takeSimulationSnapshot(SnapshotCauses.ACTION_STARTED, {
		id : this.id,
		type: this.type,
		droneId : ((drone) ? drone.id : null)
	});
}

Task.prototype.update = function (drone,gameTime) {
	if (this.status!= EXECUTING) {
		return;
	}
}

Task.prototype.finish = function (drone,gameTime) {
	this.status = FINISHED;
	this.simulationEndTime = gameTime.simulationTotal;
	this.simulationDuration = this.simulationEndTime - this.simulationStartTime;

	if (drone) {
		drone.currentTask = null;		
	}

	//Register this event
	GameplayLogger.get(this.gameplayId).log('Finishing task [ID = ' + this.id + ', type= ' + this.type + ']');
	DRM.get(this.gameplayId).takeSimulationSnapshot(SnapshotCauses.ACTION_ENDED, {
		id : this.id,
		type: this.type,
		droneId : ((drone) ? drone.id : null)
	});	
}

module.exports = Task;