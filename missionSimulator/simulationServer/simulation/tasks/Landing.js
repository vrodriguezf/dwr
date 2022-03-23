/*********************************************
* LANDING ACTION (MODELLED AS A TASK)
**********************************************/
var GameplayLogger = require('../logger/GameplayLogger');
var LogLevels = require('../logger/LogLevels');
var Task = require('./Task');

const TASK_TYPE = 'land';

function Landing(id,gameplayId,airport,initData) {
	Task.call(this,id,gameplayId,TASK_TYPE,initData);

	this.airport = airport;
}

//Inheritance
Landing.prototype = Object.create(Task.prototype);
Landing.prototype.constructor = Landing;

Landing.prototype.start = function(drone, gameTime) {

	//Removes the current drone waypoint
	drone.waypoints.shift();

	//this task doesn't take any time, just starts, apply its effects and finish
	// Restore all the payload elements
	if (drone != null) {
		Task.prototype.start.call(this,drone,gameTime);	

		for (var i=0; i<drone.payload.length; i++) {
			drone.payload[i].enable();
		}		

		GameplayLogger.get(this.gameplayId).log('Drone ' + drone.id + 
												' has landed and restored all his payload elements.');

		this.finish(drone,gameTime);
	}
	else {
		GameplayLogger.get(this.gameplayId).log('Landing task [ID = ' + 
													this.id + 
													' ] has no drone associated',LogLevels.ERROR);
	}

}

Landing.prototype.update = function (drone, gameTime) {
	Task.prototype.update.call(this,drone,gameTime);		
}

Landing.prototype.finish = function (drone, gameTime) {
	Task.prototype.finish.call(this,drone,gameTime);		
}

module.exports = Landing;