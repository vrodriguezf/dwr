/***********************************************
* SENSOR CLASS
************************************************/

const 	DEFAULT_POSITION = {x:0,y:0},
		DEFAULT_DIRECTION = -1*(Math.PI/2),
		DEFAULT_RATIO = 50,
		DEFAULT_RANGE = 2*Math.PI;

//CONSTRUCTOR
function Sensor(initData) {
	this.position = (initData.position ? initData.position : DEFAULT_POSITION);
	this.direction = (initData.direction ? initData.direction : DEFAULT_DIRECTION);
	this.ratio = (initData.ratio ? initData.ratio : DEFAULT_RATIO);
	this.range = (initData.range ? initData.range : DEFAULT_RANGE);
}

//Check if an speficic point given is deteted by the sensor
Sensor.prototype.detect = function (x,y) {
	
	//Check if the point is in the sensor ratio
	if ((Math.pow(x - this.position.x,2) + Math.pow(y - this.position.y,2)) <= Math.pow(this.ratio,2)) {
		return true;
	} else {
		return false;
	}

	//TODO - Check range angle
}

module.exports = Sensor;