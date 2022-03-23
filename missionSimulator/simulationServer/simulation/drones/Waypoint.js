/****************************************
** WAYPOINT CLASS
*****************************************/
var Constants = require('../Constants');
var GameplayLogger = require('../logger/GameplayLogger');
var GameplayUtils = require('../GameplayUtils');
var Landing = require('../tasks/Landing');
var LogLevels = require('../logger/LogLevels');
var Refueling = require('../tasks/Refueling');
var util = require('util');

//Shared variables & constants
const 	DEFAULT_ALTITUDE = 0,
		DEFAULT_SPEED = 90,
		DEFAULT_TYPE = 'route';

//CONSTRUCTOR
function Waypoint(id,gameplayId,x,y,initData) {
	this.id = id;
	this.gameplayId = gameplayId;
	this.x = x;
	this.y = y;

	this.type = (initData && initData.type)
		?	initData.type
		: 	DEFAULT_TYPE;

	this.altitude = (initData && initData.altitude)
		?	initData.altitude
		: 	DEFAULT_ALTITUDE;

	this.speed = (initData && initData.speed)
		?	initData.speed
		: 	DEFAULT_SPEED;

	this.task = (initData && initData.task)
		?	initData.task
		: 	null;

	// This value marks the time (in simulation time units) in which is planned to arrive to this
	// waypoint
	this.plannedTime = (initData && initData.time)
		?	initData.time
		: 	null;

	this.selected = false;	// ONLY FOR HUMAN CONTROL

	//If the waypoint type is 'refueling', and this waypoint has no action associated, we create a
	// (default refueling task) for this waypoint
	if (this.type == 'refueling' && this.task == null) {
		var waypointRefuelingStation = GameplayUtils.get(this.gameplayId).getFuelStationAt({x:this.x,y:this.y});

		if (waypointRefuelingStation) {
			this.task = new Refueling(this.id,this.gameplayId,waypointRefuelingStation,null,null,{
				plannedDuration : Constants.refueling.defaultRefuelingDuration
			});			
		} else {
			//Refueling waypoint not situated in a fuel station -> ERROR
			GameplayLogger.get(this.gameplayId).log('Waypoint (' + this.x + ',' + this.y + ') ' +
													'is a refueling waypoint but it is not located in a fuel station',
													LogLevels.ERROR);
		}
	}

	//If the waypoint type is 'landing', and this waypoint has no task associated, we create a 
	// (default landing task) for this waypoint
	if (this.type == 'land' && this.task == null) {
		var waypointAirport = GameplayUtils.get(this.gameplayId).getAirportAt([this.x,this.y]);

		if (waypointAirport) {
			this.task = new Landing(this.id,this.gameplayId,waypointAirport);
		}
		else {
			//Landing waypoint not situated in an airport -> ERROR
			GameplayLogger.get(this.gameplayId).log('Waypoint (' + this.x + ',' + this.y + ') ' +
													'is a landing waypoint but it is not located in an airport',
													LogLevels.ERROR);			
		}
	}
}


Waypoint.prototype.triggerTask = function (drone,gameTime) {
	if (this.task == null) {
		return;
	}

	this.task.start(drone,gameTime);
};

//Exports the class
module.exports = Waypoint;