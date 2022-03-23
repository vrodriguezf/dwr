/**
 * Created by victor on 17/11/14.
 */
var _ = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dbConf = baseRequire('/conf/dbConf');

/**
 * Schema
 **/
var schema = new Schema ({
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
    },
    name: {
        type: String
    }
});

/**
 * Plugins
 */

/**
 * Statics
 **/

/**
 * Compilation
 **/
var connection = baseRequire('/conf/DBConnections').get(dbConf.DWR.defaultConnectionName);
var collectionName = _.find(dbConf.DWR.collections,{'id' : 'simulations'}).name;
var nativeCollection = require('mongoskin').db(dbConf.DWR.getURL()).collection(collectionName);

connection.model(collectionName, schema, collectionName);
console.log(collectionName + ' model has been successfully compiled');

/**
 * Getter
 **/
exports.get = function () {
    return connection.model(collectionName);
};