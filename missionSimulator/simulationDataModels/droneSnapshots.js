/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
* Schema
**/
var droneSnapshotsSchema = new Schema ({
	simulationSnapshot: {
		type: Schema.Types.ObjectId,
		ref: 'simulationSnapshots',
	},
	//References other database
	droneId: {
		type: String,
		required : true
	},
	position: {
		x: {type: Number},
		y: {type: Number}
	},
	speed: {
		type: Number
	},
	remainingFuel: {
		type : Number
	},
	//Enum
	status : {
		type: Number
	},
	waypoints: [
		{
			id: {type : String},
			type : {type: String},
			position: {
				x : {type: Number},
				y: {type: Number}
			},
			plannedTime: {type: Number}
		}
	]
});

mongoose.model('droneSnapshots',droneSnapshotsSchema);
console.log('droneSnapshots model has been successfully compiled');