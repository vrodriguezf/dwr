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

//Model dependencies
var missionInputModel = baseRequire('/API/models/UAS_MissionInput/Missions').get();
var taskTypeModel = baseRequire('/API/models/UAS_Configuration/TaskTypes').get();

/**
 * Schema
 **/
var schema = Schema({
    _id: String
});

/**
 * Static methods
 **/
schema.statics.getById = function (id, populateLevel, generalCallback) {
    if (populateLevel == null || populateLevel == 0) {
        this
            .findOne({_id: id})
            .lean()
            .exec(generalCallback);
    }
    else {
        //Populate
        nextPopulationLevel = (populateLevel > 0) ? populateLevel-1 : populateLevel;
        this.findOne({_id:id})
            .lean()
            .exec(function (err,plan) {
                if (err) {
                    generalCallback(err,null);
                }
                else if (!plan) {
                    generalCallback(null,null);
                }
                else {
                    //1. MISSION Population
                    missionInputModel.getById(plan.mission_id,nextPopulationLevel,function (err,mission) {
                        if (err) {
                            generalCallback(err,null);
                            return;
                        }
                        plan.mission = mission;

                        //2. Objective + Task population (Task types) This is an array so we must make async parallel queries
                        async.parallel(
                            _(plan.objectives).map(function (objective) {
                                return function (callback) {
                                    async.parallel(
                                        _(objective.tasks).map(function (task) {
                                            return function (callback) {
                                                //Query the task type information
                                                taskTypeModel.getById(task.TaskTypes_id,nextPopulationLevel,function (err,resultTaskType) {
                                                    if (err) callback(err,null);
                                                    else {
                                                        task.type = resultTaskType;
                                                        callback(null,task);
                                                    }
                                                });
                                            }
                                        }).value(),
                                        function (err,results) {
                                            if (err) callback(err,null);
                                            else {
                                                objective.tasks = results;
                                                callback(null,objective);
                                            }
                                        }
                                    );
                                };
                            }).value(),
                            function (err,results) {
                                if (err) {
                                    generalCallback(err, null);
                                } else {
                                    plan.objectives = results;
                                    generalCallback(null,plan);
                                }
                            }
                        );
                    });
                }
            });
    }
};

schema.statics.getByMission = function (missionId,populateLevel,callback) {
    nativeCollection.find(
        {
            mission_id : missionId
        }
    ).toArray(callback)
};

/**
 * Compilation
 **/
var connection = baseRequire('/conf/DBConnections').get(dbConf.UAS_MissionPlan.defaultConnectionName);
var collectionName = _.find(dbConf.UAS_MissionPlan.collections,{'id' : 'MissionPlans'}).name;
var nativeCollection = require('mongoskin').db(dbConf.UAS_MissionPlan.getURL()).collection(collectionName);

connection.model(collectionName, schema, collectionName);
console.log(collectionName + ' model has been successfully compiled');

/**
 * Getter
 **/
exports.get = function () {
    return connection.model(collectionName);
};