/***********************
* GAMEPLAY UTILS - Can be accesed from any module looking in the gameplays map
**********************/
var PointAirport = require('./world/PointAirport');
var FuelStation = require('./world/FuelStation');

function GameplayUtils(gameplay) {
	this.gameplay = gameplay;
}

//Returns the fuel station instance located at 'position' parameter, or null
//if there's no fuel station in that point
GameplayUtils.prototype.getFuelStationAt = function (position) {

	var fuelStations = this.gameplay.gameStatus.fuelStations;

	for (var i=0; i<fuelStations.length; i++) {
		if (fuelStations[i] instanceof FuelStation) {
			if (fuelStations[i].position.x == position.x && fuelStations[i].position.y == position.y) {
				return fuelStations[i];
			}
		}
	}

	//If there's no fuel station in the given position, return a null object
	return null;
}

//Position is an array with the coordinates
GameplayUtils.prototype.getAirportAt = function (position) {
	var airports = this.gameplay.gameStatus.airports;

	for (var i=0; i<airports.length; i++) {
		if (airports[i] instanceof PointAirport) {
			if (airports[i].position.x == position[0] && airports[i].position.y == position[1]) {
				return airports[i];
			}
		}
	}

	return null;
};

/** Utility to set the control mode from any module in the server */
GameplayUtils.prototype.setControlMode = function (controlMode,options) {

	if (options && options.caller) {
		//Check if the caller UAV is selected. If not, the control mode cannot change
		if (this.gameplay.gameStatus.selectedDrone != null &&
			this.gameplay.gameStatus.selectedDrone == options.caller) {
			this.gameplay.setControlMode(controlMode);
		}
		else {
			return;
		}
	}

	this.gameplay.setControlMode(controlMode);
}

GameplayUtils.prototype.addNewIncident = function (newIncident) {
	this.gameplay.addNewIncident(newIncident);
}

module.exports.GameplayUtils = GameplayUtils;

module.exports.get = function (gameplayId) {
	return global.gameplaysMap.get(gameplayId).utils
}