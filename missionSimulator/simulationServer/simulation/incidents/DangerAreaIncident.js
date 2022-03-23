/*************************************
* DANGER AREA
*************************************/
var Area = projRequire('/areas/Area');
var Incident = projRequire('/incidents/Incident');
var Levels = require('./Levels');


const INCIDENT_TYPE = "DangerAreaIncident";
const DEFAULT_LEVEL = Levels.CAUTION;

function DangerAreaIncident(id,gameplayId,startTime,endTime,area,initData) {

	var level = (initData && initData.level)
		?	initData.level
		: 	DEFAULT_LEVEL;

	//Super constructor
	Incident.call(this,id,gameplayId,INCIDENT_TYPE,level,startTime,initData);

	//Sub-fields 
	this.endTime = endTime; // milliseconds

	//Area
	if (area instanceof Area) {
		this.area = area;
	}
	else {
		//Creates a new Area class with the area information given
		// TODO : Id useless?!?!
		this.area = new Area(id,area.vertices);	
	}
}

//Inheritance
DangerAreaIncident.prototype = Object.create(Incident.prototype);
DangerAreaIncident.prototype.constructor = DangerAreaIncident;

//@Override
DangerAreaIncident.prototype.update = function (gameTime) {
	if (gameTime.simulationTotal >= this.endTime) {
		this.finish();
	}
}

module.exports = DangerAreaIncident;