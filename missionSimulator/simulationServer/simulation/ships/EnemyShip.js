/*******************************************
* ENEMY CLASS (Inherits from Ship)
*******************************************/
var util = require('util');
var Ship = require('./Ship');
var helpers = require('../utils/helpers');

const 	SHIP_TYPE = 1, //To distinguish between ships in client
		DEFAULT_SPEED = 2,
		MIN_LOOPS_BETWEEN_ROTATION = 100,
		RANDOM_POSITIVE_ROTATION_THRESHOLD = 0.7,
		RANDOM_NEGATIVE_ROTATION_THRESHOLD = 0.3;

//Contructor
function EnemyShip(id,gameplayId,area,initData) {
  	// Call the parent constructor, making sure (using Function#call) that "this" is
  	// set correctly during the call	
	Ship.call(this,id,gameplayId, SHIP_TYPE);

	this.area = area;

	//Init parameters
	this.position = (initData && initData.position)
		? initData.position
		: this.area.centroidPoint();

	this.speed = (initData && initData.speed)
		?	initData.speed
		: 	DEFAULT_SPEED;

	//Tries to change the rotation of the ship every x ms
	this.timeSinceLastRotation = 0;
}

EnemyShip.prototype = Object.create(Ship.prototype);
EnemyShip.prototype.constructor = EnemyShip;

//Replace the update method
EnemyShip.prototype.update = function (gameTime) {

	//Check if we are still in the area restricted
	if (!this.area.contains(this.position.x,this.position.y)) {
		//Reverse the direction of the ship
		this.rotation += Math.PI;
		this.timeSinceLastRotation = 0;
	}
	else {
		this.timeSinceLastRotation ++;
		if (this.timeSinceLastRotation >=MIN_LOOPS_BETWEEN_ROTATION) {
			this.timeSinceLastRotation = 0;
			this.changeRotation();
		}		
	}

	//Call the parent update method
	Ship.prototype.update.call(this,gameTime);
}

EnemyShip.prototype.changeRotation = function () {

	var rnd = Math.random();

	if ( rnd < RANDOM_NEGATIVE_ROTATION_THRESHOLD) {
		this.rotation = helpers.normalizeAngle(this.rotation - Math.PI/2);
		//console.log('--Ship ' + this.id + ' -- Rotation changed to ' + this.rotation);
	}
	else if (rnd > RANDOM_POSITIVE_ROTATION_THRESHOLD) {
		this.rotation = helpers.normalizeAngle(this.rotation - Math.PI/2);
		//console.log('--Ship ' + this.id + ' -- Rotation changed to ' + this.rotation);
	}
}

module.exports = EnemyShip;