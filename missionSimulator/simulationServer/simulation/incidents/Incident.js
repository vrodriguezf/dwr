/************************************************
* INCIDENT CLASS
************************************************/
var DRM = require('../drm/DRM');
var GameplayLogger = require('../logger/GameplayLogger')
var IncidentStatus = require('./IncidentStatus');
var LogLevels = require('../logger/LogLevels');
var SnapshotCauses = require('../../shared/snapshotCauses');

//Constructor (NOTE: Not all the incidents must have an end time)
function Incident (id,gameplayId,type,level,startTime,initData) {
	this.id = id;
	this.gameplayId = gameplayId;
	this.type = type;
	this.level = level;
	this.startTime = startTime; //Entry seconds -> System Milliseconds

	this.message = (initData && initData.message)
		? 	initData.message
		: 	"";

	this.status = IncidentStatus.INACTIVE;
}

//@ToOverride
Incident.prototype.start = function (params) {
	this.status = IncidentStatus.ACTIVE;

	//Register this event taking a snapshot of the simulation
	DRM.get(this.gameplayId).takeSimulationSnapshot(SnapshotCauses.INCIDENT_STARTED, {
		incidentId : this.id,
		incidentType : this.type
	});
	GameplayLogger.get(this.gameplayId).log('Incident ' + this.id + ' started : [' + this.message + ']',
											LogLevels.WARNING);
}

//@ToOverride
Incident.prototype.update = function (gameTime) {
}

Incident.prototype.finish = function () {
	this.status = IncidentStatus.INACTIVE;
	
	DRM.get(this.gameplayId).takeSimulationSnapshot(SnapshotCauses.INCIDENT_ENDED, {
		incidentId : this.id,
		incidentType : this.type
	});
	GameplayLogger.get(this.gameplayId).log('Incident ' + this.id + ' finished',
											LogLevels.WARNING);	
}

module.exports = Incident;