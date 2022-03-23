/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
* Schema
**/
var simulationsSchema = new Schema ({
	plannedTime 	: 	{type: Number, min: 0},
	missionPlan 	: 	{
		id : {type: String, required: true},
		description: {type: String},
		test: {type: Boolean, default: true}
	},
	scenaryScheduler : 	{
		id : {type: String, required: false},
		description: {type: String},
		test: {type: Boolean, default: true}
	},
	targetsDefinition : {
		id: {type: String, required: false},
		description: {type: String},
		test: {type: Boolean, default: true}
	},
	createdAt : {
		type: Date,
		default : Date.now
	},
	clientIP : {
		type : String
	}
});

mongoose.model('simulations',simulationsSchema);
console.log('Simulations model has been successfully compiled');