/****************************************
* POINT AIRPORT CLASS
 * Represents an airport only defined by a point in space, not an area
*****************************************/
var Airport = require('./Airport');

const type = 'PointAirport';

function PointAirport(id,position,options) {

	Airport.call(this,id,type,options);

	this.position = position;
}

//Inheritance
PointAirport.prototype = Object.create(Airport.prototype);
PointAirport.prototype.constructor = PointAirport;

module.exports = PointAirport;