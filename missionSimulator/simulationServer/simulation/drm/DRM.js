/***************************************
* DATA RECOVERY MODULE (DRM)
****************************************/

// Module dependencies
var mongoose = require('mongoose');

// Database model
var ConfigurationParameters = baseRequire('/conf/ConfigurationParameters');
var Constants = projRequire('/Constants');
if (ConfigurationParameters.useDB) {
	var DroneSnapshots = baseRequire('/API/models/DWR/DroneSnapshots').get();
}
var events = require('events');
var GameplayLogger = projRequire('/logger/GameplayLogger');
var LogLevels = require('../logger/LogLevels');

if (ConfigurationParameters.useDB) {
	var Simulations = baseRequire('/API/models/DWR/Simulations').get();
	var SimulationSnapshots = baseRequire('/API/models/DWR/SimulationSnapshots').get();
}


// Load mongoose and get the models previously loaded (compiled)

function DRM (gameplay, options) {

	//Super-constructor
	events.EventEmitter.call(this);

	this.gameplay = gameplay;

	//Constructor options
	this.enabled = ConfigurationParameters.useDB;

	//Creates the simulation model instance (Document)
	if (this.enabled) {
		this.simulationDocument = new Simulations;
	}
}

// EventEmitter -> DRM (Inheritance)
DRM.prototype = Object.create(events.EventEmitter.prototype);
DRM.prototype.constructor = DRM;

//Updates its status with the simulation time data (Flush cache) TODO
DRM.prototype.update = function (gameTime) {
	if (!this.enabled) return;
};

DRM.prototype.takeSimulationSnapshot = function(cause,params) {

	if (!this.enabled) return;

	var simulationSnapshot = new SimulationSnapshots;

		simulationSnapshot.simulation = this.simulationDocument;	//Reference
		simulationSnapshot.elapsedSimulationTime = this.gameplay.gameStatus.time.simulationTotal;
		simulationSnapshot.elapsedRealTime = this.gameplay.gameStatus.time.total;
		simulationSnapshot.simulationSpeed = this.gameplay.gameStatus.time.simulationTimeRatio;
		simulationSnapshot.cause.id = cause;
		simulationSnapshot.cause.params = params;
		//simulationSnapshot.input = (params) ? params.inputId : null;

	//Take drone snapshots of all the available drones in the current gameStatus
	for (var i=0; i<this.gameplay.gameStatus.drones.length; i++) {
		var droneInLoop = this.gameplay.gameStatus.drones[i];
		this.saveDroneSnapshot(this.gameplay.gameStatus.drones[i],simulationSnapshot);
	}

	//Save the snapshot in the database
	var self = this; //TO use this in the callbacks
	simulationSnapshot.save(function (err) {
		if (err) {
			console.log(err);
		}
		else {
			GameplayLogger.get(self.gameplay.id).log('Simulation snapshot taken successfully',LogLevels.DEBUG);
		}
	});

	//Emit an event with the new data saved (The analyzer will listen to this event)
	this.emit(Constants.DRM.dataEventName, {
		type : 'simulationSnapshot',
		content : simulationSnapshot
	});
};

DRM.prototype.saveSimulation = function(options,callback) {

	if (!this.enabled) return;

	this.simulationDocument.missionPlan = this.gameplay.importedMissionPlan;
	this.simulationDocument.scenaryScheduler= this.gameplay.importedScenaryScheduler;
	this.simulationDocument.targetsDefinition= this.gameplay.importedTargetsDefinition;
	this.simulationDocument.clientIP = (options && options.clientIP)
		?	options.clientIP
		: 	null;
	this.simulationDocument.name = (options && options.name)
		?	options.name
		:	null;

	//Save the document in MongoDB database
	var self = this;
	this.simulationDocument.save(function (err, result) {
		if (err) callback(err,result);
		else {
			GameplayLogger.get(self.gameplay.id).log('Simulation saved successfully', LogLevels.DEBUG);
			callback(null,result);
		}
	});
};

DRM.prototype.saveDroneSnapshot = function (drone, simulationSnapshot) {

	if (!this.enabled) return;

	if (!(simulationSnapshot instanceof SimulationSnapshots)) {
		//TODO : Log error?
		console.log('Error saving drone snapshot!! [Bad parameters]');
		return;
	}

	var droneSnapshotDocument = new DroneSnapshots;
		droneSnapshotDocument.simulationSnapshot = simulationSnapshot;
		droneSnapshotDocument.droneId = drone.id;
		droneSnapshotDocument.position = drone.position;
		droneSnapshotDocument.speed = drone.speed;
		droneSnapshotDocument.remainingFuel = drone.remainingFuel;
		droneSnapshotDocument.status = drone.status.key;

		//Save the current drone waypoints
		for (var i=0; i<drone.waypoints.length; i++) {
			droneSnapshotDocument.waypoints.push({
				id: drone.waypoints[i].id,
				type: drone.waypoints[i].type,
				position : {
					x : drone.waypoints[i].x,
					y : drone.waypoints[i].y
				},
				plannedTime : drone.waypoints[i].plannedTime
			});
		}

	droneSnapshotDocument.save(function (err) {
		if (err) {
		console.log('Error saving drone snapshot!!' + err);
		}
		else {
		}
	});
};

module.exports.DRM = DRM;

module.exports.get = function (gameplayId) {
	return global.gameplaysMap.get(gameplayId).drm
};