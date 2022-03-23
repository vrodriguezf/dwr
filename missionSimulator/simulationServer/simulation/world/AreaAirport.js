/****************************************
 * AREA AIRPORT CLASS
 * Represents an airport whose position is defined by an area
 *****************************************/
var Airport = require('./Airport');
var Area = projRequire('/areas/Area');

const type = 'AreaAirport';

function AreaAirport(id,areaPoints,options) {

    Airport.call(this,id,type,options);

    //Creates the area using the points given as parameter
    this.area = new Area(id+'-area',areaPoints);

    //Establish the position of the airport in the center of the area
    this.position = this.area.centroidPoint();
}

//Inheritance
AreaAirport.prototype = Object.create(Airport.prototype);
AreaAirport.prototype.constructor = AreaAirport;

module.exports = AreaAirport;