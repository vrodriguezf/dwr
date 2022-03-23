/******************************************
** SHIP CLASS
******************************************/
var Constants = require('../Constants');
var GameplayLogger = require('../logger/GameplayLogger');
var Helpers = require('../utils/helpers');
var LogLevels = require('../logger/LogLevels');

const 	DEFAULT_POSITION = {x: 0,y:0},
		DEFAULT_SPEED = 2,
		DEFAULT_ROTATION = Math.PI/2;

//Constructor
function Ship(id,gameplayId, type) {
	this.id = id;
	this.gameplayId = gameplayId;
	this.type = type;
	this.position = DEFAULT_POSITION;
	this.speed = DEFAULT_SPEED;
	this.rotation = DEFAULT_ROTATION;
	this.inCoast = false;
	this.detected = false;
	this.visible = false;	//Default = false

	this.timeUntilNextVisibilityChange = Helpers.getRandomInteger(	Constants.ship.minTimeBetweenVisibilityChanges,
																	Constants.ship.maxTimeBetweenVisibilityChanges);
	this.timeSinceLastVisibilityChange = 0;
}

//Initialize the enemy status
Ship.prototype.init = function (initData) {

	if (initData.position) this.position = initData.position;
	if (initData.speed) this.speed = initData.speed;
	if (initData.rotation) this.rotation = initData.rotation;

}

//Ship update (Basic movement)
Ship.prototype.update = function (gameTime) {

	if (this.inCoast || this.detected) {
		return;
	}

	this.position.x += Helpers.round(Math.cos(this.rotation)*Helpers.getDistanceTravelled(this.speed, gameTime.simulationElapsedTime));
	this.position.y += Helpers.round(Math.sin(this.rotation)*Helpers.getDistanceTravelled(this.speed, gameTime.simulationElapsedTime));

	//visibility change
	this.timeSinceLastVisibilityChange += gameTime.elapsedTime;

	if (this.timeSinceLastVisibilityChange > this.timeUntilNextVisibilityChange) {
		//Change visibility
		this.changeVisibility();

		this.timeSinceLastVisibilityChange = 0;
		this.timeUntilNextVisibilityChange = Helpers.getRandomInteger(	Constants.ship.minTimeBetweenVisibilityChanges,
																		Constants.ship.maxTimeBetweenVisibilityChanges);
		GameplayLogger.get(this.gameplayId).log('Time until next visibility change for Ship ' + this.id + ' : [' + this.timeUntilNextVisibilityChange + ']',
												LogLevels.DEBUG);
	}
}

Ship.prototype.setDetected = function (isDetected) {
	this.detected = isDetected;
}

//Changes visibility randomly
Ship.prototype.changeVisibility = function () {

	var visibilityDice = Math.random();

	if (visibilityDice <= Constants.ship.visibilityThreshold) {
		this.visible = false;
	} else {
		this.visible = true;
	}

	//Register the event (Log)
	GameplayLogger.get(this.gameplayId).log('Ship ' + this.id + ' has set its visibility to [' + this.visible + ']', LogLevels.DEBUG);
}

module.exports = Ship;