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
var collectionName = _.find(dbConf.DWR.collections,{'id' : 'simulationSnapshots'}).name;
var nativeCollection = require('mongoskin').db(dbConf.DWR.getURL()).collection(collectionName);

connection.model(collectionName, schema, collectionName);
console.log(collectionName + ' model has been successfully compiled');

/**
 * Getter
 **/
exports.get = function () {
    return connection.model(collectionName);
};