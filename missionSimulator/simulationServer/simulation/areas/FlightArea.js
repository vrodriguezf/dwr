/************************************
* FLIGHT AREA (Inherits from Area)
**************************************/
var Area = require('./Area');

function FlightArea(id,vertices, entryPoint, exitPoint) {
	Area.call(this,id,vertices);

	this.entryPoint = (entryPoint != null)
		?	entryPoint
		:	this.centroidPoint();

	this.exitPoint = (exitPoint != null)
		?	exitPoint
		:	this.centroidPoint();
}

//Inheritance
FlightArea.prototype = Object.create(Area.prototype);
FlightArea.prototype.constructor = FlightArea;

module.exports = FlightArea;