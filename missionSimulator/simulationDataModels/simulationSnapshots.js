/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
* Schema
**/
var simulationSnapshotsSchema = new Schema ({
	simulation : {
		type: Schema.Types.ObjectId,
		required: true
	},
	elapsedSimulationTime: {
		type: Number,
		required: true
	},
	elapsedRealTime: {
		type: Number,
		required: true
	},
	simulationSpeed: {
		type: Number
	},
	cause: {
		id : {
			type: Number,
			min: 0
		},
		key: {
			type: String
		},
		params : Schema.Types.Mixed
	},
	// Only != null if cause == 'User input'
	input: {
		type: Number
	}
});

mongoose.model('simulationSnapshots',simulationSnapshotsSchema);
console.log('simulationSnapshots model has been successfully compiled');