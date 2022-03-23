/**************************************
* SURVEILLANCE TASK
***************************************/
var Area = require('../areas/Area');
var Task = require('./Task');

const TASK_TYPE = 'surveillance';

function Surveillance(id,gameplayId,area,initData) {

	//TODO: Every task type should be defined as a new task subclass (Action -> Task -> Surveillance)
	var taskType = (initData && initData.type)
		?	initData.type
		: 	TASK_TYPE;

	if (taskType == 'support') {
		console.log(area);
	}

	Task.call(this,id,gameplayId,taskType,initData);

	this.area = area;

	//TODO : Create true waypoints ( Waypoint Class) instead of file ones
	//TODO: Automatically create a path planning
	this.waypoints = (initData && initData.area_waypoints)
		?	initData.area_waypoints
		: 	[];
}

//Inheritance
Surveillance.prototype = Object.create(Task.prototype);
Surveillance.prototype.constructor = Surveillance;

Surveillance.prototype.start = function (drone,gameTime) {
	//Remove the waypoint and Add the area waypoints to the drone waypoints
	drone.waypoints.shift();
	drone.setPath(this.waypoints.concat(drone.waypoints));

	this.lastAreaWaypoint = this.waypoints[this.waypoints.length-1];

	Task.prototype.start.call(this,drone,gameTime);
};

Surveillance.prototype.update = function (drone,gameTime) {
	//We finish the task when we reach the last waypoint. TODO: Waht if we move the last waypoint?!?!
	/*
	if (drone.position.x == this.lastAreaWaypoint.x && drone.position.y == this.lastAreaWaypoint) {
		this.finish(drone,gameTime);
	}
	*/

	Task.prototype.update.call(this,drone,gameTime);
};

module.exports = Surveillance;