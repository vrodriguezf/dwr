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
var collectionName = _.find(dbConf.DWR.collections,{'id' : 'droneSnapshots'}).name;
var nativeCollection = require('mongoskin').db(dbConf.DWR.getURL()).collection(collectionName);

connection.model(collectionName, schema, collectionName);
console.log(collectionName + ' model has been successfully compiled');

/**
 * Getter
 **/
exports.get = function () {
    return connection.model(collectionName);
};