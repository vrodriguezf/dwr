var Constants = require('../Constants');
var util = require('util');

module.exports = ({

	getRandomInteger : function(min, max) {
		return min + Math.round(Math.random() * ((max - min) + 1));
	},

	//Returns a random point inside a Rectangle given
	getRandomPosition : function (minX,minY,width,height) {
		return {
			x : this.getRandomInteger(minX,minX + width),
			y : this.getRandomInteger(minY,minY + height)
		};
	},

	normalizeAngle: function (angle) {
		var normalizedAngle = angle;

		while (Math.abs(normalizedAngle) > Math.PI) {
			if (normalizedAngle < (-1)*Math.PI) {
				normalizedAngle += 2*Math.PI;
			}
			else {
				normalizedAngle -= 2*Math.PI;
			}
		}

		return normalizedAngle;
	},

	getDroneById: function (drones,id) {

		for (var i=0; i<drones.length; i++) {
			if (drones[i].id == id) {
				return drones[i];
			}
		}

		return null;
	},

	//Returns the element of "array" with a property called "id" matching with
	// the id passed as a parameter
	getById: function (array,id) {

		if (array == null || id == null) {
			return null;
		}

		for (var i=0; i<array.length; i++) {
			if (array[i].id == id) {
				return array[i];
			}
		}

		return null;		
	},	

	getDistanceBetween: function (point1, point2) {
		return this.round(Math.sqrt(Math.pow(point1.x - point2.x,2) +
							Math.pow(point1.y - point2.y,2)));
	},

	round: function (number, precision) {

		var _precision

		if (precision == null) {
			_precision = Constants.decimalPrecisionNumber;
		} else {
			_precision = precision;
		}

		return (Math.round(number*Math.pow(10,_precision)))/Math.pow(10,_precision);

	},

	getDistanceTravelled: function (speed, timeInMs) {
		return this.round(speed*timeInMs/3600000);
	},

	//given a speed (Km/h), it returns how much kilometers must move an element each update, 
	//if it has that speed (TODO : )
	getDistanceTravelledPerUpdate: function (speed) {
		return this.round((speed*Constants.gameTime.timeBetweenUpdates)/(3600000));
	}
		
});