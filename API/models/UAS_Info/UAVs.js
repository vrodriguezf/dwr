/**
 * Created by victor on 12/11/14.
 */
/**
 * Created by victor on 12/11/14.
 */
var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');
var dbConf = baseRequire('/conf/dbConf');

/**
 * Model dependencies
 */
var sensorModel = baseRequire('/API/models/UAS_Info/Sensors').get();

/**
 * Schema
 **/
var schema = Schema({
    _id: String
});

/**
 * Plugins
 */

/**
 * Statics
 **/
schema.statics.getById = function (id, populateLevel, generalCallback) {
    if (populateLevel == null || populateLevel == 0) {
       this
           .findOne({_id: id})
           .lean()
           .exec(generalCallback);
    }
    else {
        var nextPopulationLevel = (populateLevel > 0) ? populateLevel-1 : populateLevel;
        this
            .findOne({_id : id})
            .lean()
            .exec(function (err,uav) {
                if (err) generalCallback(err,null);
                //POPULATION
                //Sensors
                async.parallel(
                    _(uav.sensors).map(function (sensor) {
                        return function (callback) {
                            sensorModel.getById(sensor.Sensors_id,nextPopulationLevel,function (err,result) {
                               if (err) callback(err,null);
                                else {
                                   _.assign(sensor,result);
                                   callback(null,sensor);
                               }
                            });
                        }
                    }).__wrapped__,
                    function (err, results) {
                        uav.sensors = results;
                        generalCallback(err,uav); //Final callback
                    }
                );
            });
    }
};

/**
 * Compilation
 **/
var connection = baseRequire('/conf/DBConnections').get(dbConf.UAS_Info.defaultConnectionName);
var collectionName = _.find(dbConf.UAS_Info.collections,{'id' : 'UAVs'}).name;

connection.model(collectionName, schema, collectionName);
console.log(collectionName + ' model has been successfully compiled');

/**
 * Getter
 **/
exports.get = function () {
    return connection.model(collectionName);
};