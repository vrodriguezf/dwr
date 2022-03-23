var util = require('util');
var Constants = require('../Constants');
var Drone = require('../drones/Drone');

/****************************************
* FUEL STATION CLASS
*****************************************/
const 	DEFAULT_POS = {x: 0,y:0},
		DEFAULT_CAPACITY = 100000,
		DEFAULT_REFUELING_SPEED = 5

//Shared variables & constants

function FuelStation (id,position,options) {

	this.id = id;

	this.position = position

	this.capacity = (options.capacity)
		? options.capacity
		: DEFAULT_CAPACITY;

	this.refuelingSpeed = (options.refuelingSpeed)
		?	options.refuelingSpeed
		: 	DEFAULT_REFUELING_SPEED;

	this.remainingFuel = this.capacity;
}

FuelStation.prototype.update = function (gameTime) {
}

module.exports = FuelStation;