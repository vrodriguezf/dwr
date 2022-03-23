/*****************************************
* RADAR CLASS
*****************************************/
var Constants = require('../Constants');
var PayloadElement = require('./PayloadElement');

function Radar (id,position,initData) {

	PayloadElement.call(this,id,Constants.payload.radar.typeName);

	this.position = position;

	this.ratio = (initData && initData.ratio)
		?	initData.ratio
		: 	Constants.payload.radar.defaultRatio;

}

//Inheritance
Radar.prototype = Object.create(PayloadElement.prototype);
Radar.prototype.constructor = Radar;

Radar.prototype.detect = function (x,y) {

	if (!this.enabled) {
		return false;
	}

	//Check if the point is in the radar ratio
	if ((Math.pow(x - this.position.x,2) + Math.pow(y - this.position.y,2)) <= Math.pow(this.ratio,2)) {
		return true;
	} else {
		return false;
	}
}

module.exports = Radar;
