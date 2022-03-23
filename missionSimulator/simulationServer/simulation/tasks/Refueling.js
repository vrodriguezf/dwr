/**********************************
* REFUELING TASK
***********************************/
var DroneStatus = require('../drones/DroneStatus');
var GameplayLogger = require('../logger/GameplayLogger');
var Task = require('./Task');
var Helpers = require('../utils/helpers');

const TASK_TYPE = 'refueling';

function Refueling(id,gameplayId,refuelingStation,plannedStartTime,plannedEndTime,initData) {

	//Super constructor
	Task.call(this,id,gameplayId,TASK_TYPE,{
		plannedStartTime : plannedStartTime,
		plannedEndTime: plannedEndTime,
		plannedDuration: (plannedEndTime != null && plannedStartTime != null) 
					? (plannedEndTime-plannedStartTime)	//Seconds
					: initData.duration
	});

	//Sub-fields
	this.refuelingStation = refuelingStation;

	this.droneSpeed = null;
}

//Inheritance
Refueling.prototype = Object.create(Task.prototype);
Refueling.prototype.constructor = Refueling;

Refueling.prototype.start = function (drone,gameTime) {

	//Removes the current drone waypoint and stop it
	drone.waypoints.shift();
	this.droneSpeed = drone.speed; //Save last speed
	drone.speed = 0;
	drone.status = DroneStatus.REFUELING;
	
	Task.prototype.start.call(this,drone,gameTime);

}

Refueling.prototype.update = function (drone,gameTime) {

	//Respect the planned duration!!!
	if (gameTime.simulationTotal >= (this.simulationStartTime + this.plannedDuration*1000)) {
		this.finish(drone,gameTime);		
	}

	// Calculate how much fuel must be inserted in this update, depending on the refuelingSpeed
	// of the station
	var fuelCharge = Helpers.round((gameTime.simulationElapsedTime*this.refuelingStation.refuelingSpeed)/1000);
	console.log(fuelCharge);
	var fuelToInsert = Math.min(fuelCharge,this.refuelingStation.remainingFuel,(drone.fuelCapacity-drone.remainingFuel));

	drone.remainingFuel = Helpers.round(drone.remainingFuel + fuelToInsert);
	this.refuelingStation.remainingFuel = Helpers.round(this.refuelingStation.remainingFuel - fuelToInsert);

	GameplayLogger.get(this.gameplayId).log('Refueling drone ' + 
											drone.id + 
											' [ + ' + Helpers.round(fuelToInsert,2) +
											' L]');

	Task.prototype.update.call(this,drone,gameTime);
}

Refueling.prototype.finish = function (drone,gameTime) {

	//Reset drone data
	drone.speed = this.droneSpeed;
	drone.status = DroneStatus.CRUISE;

	Task.prototype.finish.call(this,drone,gameTime);
}

module.exports = Refueling;