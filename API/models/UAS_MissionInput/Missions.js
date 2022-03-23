/**
 * Created by victor on 12/11/14.
 */

/**
 * Module dependencies.
 */
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dbConf = baseRequire('/conf/dbConf');

/**
 * Model dependencies
 */
var gcssModel = baseRequire('/API/models/UAS_Info/GCSs').get();
var uavModel = baseRequire('/API/models/UAS_Info/UAVs').get();
var noFlightZoneModel = baseRequire('/API/models/UAS_Info/NoFlightZones').get();
var airportModel = baseRequire('/API/models/UAS_Info/Airports').get();
var objectiveTypesModel = baseRequire('/API/models/UAS_Configuration/ObjectiveTypes').get();

/**
 * Schema
 **/
var schema = Schema({
    _id: String
});

/**
 * Statics methods
 **/
schema.statics.findAll = function (callback) {
    this
        .find()
        .lean()
        .exec(callback);
};

schema.statics.getById = function (id, populateLevel, generalCallback) {
    if (populateLevel == null || populateLevel == 0) {
        this
            .findOne({_id: id})
            .lean()
            .exec(generalCallback);
    }
    else {
        //Populate
        var nextPopulationLevel = (populateLevel > 0) ? populateLevel-1 : populateLevel;
        this.findOne({_id:id})
            .lean()
            .exec(function (err,mission) {
                if (err) generalCallback(err,null);
                //Population (chain of async-parallel operations)
                //GCSs
                async.parallel(
                    _(mission.scenary.gcss).map(function (gcs){

                        var query = function (callback) {
                            gcssModel.getById(gcs.GCSs_id,nextPopulationLevel,function (err,resultGcs) {
                                _.assign(gcs,resultGcs);
                                callback(null,gcs);
                            });
                        };
                        //Query task to perform in parallel
                        return query;
                    }).__wrapped__,
                    function(err, results) {
                        mission.scenary.gcss = results;

                        //UAV's
                        async.parallel(
                            _(mission.scenary.uavs).map(function (uav) {
                                return function (callback) {
                                    uavModel.getById(uav.UAVs_id,nextPopulationLevel,function (err,resultUAV) {
                                        if (err) callback(err,null);
                                        else {
                                            _.assign(uav,resultUAV);
                                            callback(null,uav);
                                        }
                                    });
                                };
                            }).__wrapped__,
                            function (err, results) {
                                mission.scenary.uavs = results;

                                //No Flight Zones
                                async.parallel(
                                    _(mission.scenary.no_flight_zones).map(function (noFlightZone) {
                                        return function (callback) {
                                            //Only create a query for the static no flight areas
                                            if (noFlightZone.volume) {
                                                callback(null,noFlightZone);
                                            }
                                            else {
                                                noFlightZoneModel.getById(noFlightZone.NoFlightZones_id,nextPopulationLevel, function (err,resultNoFlightZone) {
                                                    if (err) callback(err,null);
                                                    else {
                                                        _.assign(noFlightZone,resultNoFlightZone); //Extend the original object
                                                        callback(null,noFlightZone);
                                                    }
                                                });
                                            }
                                        }
                                    }).__wrapped__,
                                    function (err, results) {
                                        mission.scenary.no_flight_zones = results;

                                        //Static No flight zones
                                        //TODO: Query only the NoflightZones in the mission bounds, not all of them
                                        noFlightZoneModel.findAll(function (err,results) {
                                            //Add to the mission no flight zones only the areas that are not present already
                                            _(results).filter(function (result) {
                                                return ((_.find(mission.scenary.no_flight_zones,{'NoFlightZones_id' : result._id})) == null)
                                            }).forEach(function (filteredResult) {
                                                _.assign(filteredResult,{'NoFlightZones_id' : filteredResult._id}); //Equality in results array
                                                mission.scenary.no_flight_zones.push(filteredResult);
                                            });

                                            // AIRPORTS
                                            //TODO: Query only the airports inside the mission bounds
                                            airportModel.findAll(function (err,results) {
                                                if (err) generalCallback(err,null);
                                                mission.scenary.airports = results;

                                                /**
                                                 * Static GCS's
                                                 */
                                                //TODO: Query only the static GCS's inside the mission bounds
                                                gcssModel.getStaticGCSs(function (err,results) {
                                                    if (err) generalCallback(err,null);
                                                    else {
                                                        mission.scenary.gcss = mission.scenary.gcss.concat(results);

                                                        /**
                                                         * Objective types
                                                         */
                                                        async.parallel(
                                                            _(mission.objectives).map(function (objective) {
                                                                return function (callback) {
                                                                    objectiveTypesModel.getById(objective.ObjectiveTypes_id,nextPopulationLevel, function (err,result) {
                                                                        if (err) callback(err,null)
                                                                        else {
                                                                            objective.info = result;
                                                                            callback(null,objective);
                                                                        }
                                                                    });
                                                                }
                                                            }).value(),
                                                            function (err,results) {
                                                                if (err) generalCallback(err,null);
                                                                else {
                                                                    mission.objectives = results;
                                                                    generalCallback(err,mission);   //END of callback-chain
                                                                }
                                                            }
                                                        );
                                                    }
                                                });
                                            });
                                        });
                                    }
                                );
                            }
                        );
                    }
                );


            });
    }
};

/**
 * Compilation
 **/
var connection = baseRequire('/conf/DBConnections').get(dbConf.UAS_MissionInput.defaultConnectionName);
var collectionName = _.find(dbConf.UAS_MissionInput.collections,{'id' : 'MissionInputs'}).name;

connection.model(collectionName, schema, collectionName);
console.log(collectionName + ' model has been successfully compiled');

/**
 * Getter
 **/
exports.get = function () {
  return connection.model(collectionName);
};