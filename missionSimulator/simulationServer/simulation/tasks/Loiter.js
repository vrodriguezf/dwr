/**********************************
* REFUELING TASK
***********************************/
var Task = require('./Task');
var math = require('mathjs');

const TASK_TYPE = 'loiter';
const DEFAULT_LOITER_RATIO = 2; //km
const DEFAULT_WAYPOINTS_PER_LOOP = 8;

function Loiter(id,gameplayId,startTime,endTime,initData) {
	//Super constructor
	Task.call(this,id,TASK_TYPE,{
		start_time : startTime,
		end_time: endTime,
		duration: endTime-startTime
	});

	this.loiterRatio = (initData && initData.loiterRatio)
		?	initData.loiterRatio
		: 	DEFAULT_LOITER_RATIO;

	this.waypointsPerLoop = (initData && initData.waypointsPerLoop)
		? 	initData.waypointsPerLoop
		: 	DEFAULT_WAYPOINTS_PER_LOOP;

	//Calculate the position of the waypoints in the complex plane (later we will trasnport them to the world)
	this.waypointsInComplexPlane = [];
	for (var i=0; i<this.waypointsPerLoop; i++) {
		this.waypointsInComplexPlane.push(math.complex({
			r : this.loiterRatio,
			phi : ((2*Math.PI)*i)/this.waypointsPerLoop
		}));
	}

	this.waypoints = [];
}

//Inheritance
Loiter.prototype = Object.create(Task.prototype);
Loiter.prototype.constructor = Loiter;

Loiter.prototype.start = function (drone) {

	//TODO: Define a set of waypoints through the loiter (Use mathjs)
	// TODO: Move part of this work to the constructor?

	Task.prototype.start.call(this,drone);
}

Loiter.prototype.update = function (drone,gameTime) {

	Task.prototype.update.call(this,drone,gameTime);
}

Loiter.prototype.finish = function (drone) {

	Task.prototype.finish.call(this,drone);
}

module.exports = Loiter;