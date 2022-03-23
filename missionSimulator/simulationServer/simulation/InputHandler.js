//Module dependencies
var Constants = require('./Constants');
var util = require('util');

var helpers = require('./utils/helpers');

//Auxiliar functions
function addDroneWayPoint() {

}

//Contructor

function addWayPoint(gameStatus) {
}


//What the module exports for the other modules 
module.exports = {
	handleInput: function (input,gameStatus) {
		if (!input) {
			return;
		}

		util.log(util.inspect(gamePlay));

		if (input.name == Constants.input.addWayPoint.name) {
			
		} else {
			util.log('Input not recognized');
		}
	}
}