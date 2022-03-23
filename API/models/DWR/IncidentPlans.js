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
var schema = Schema({
    _id: String
});

/**
 * Plugins
 */

/**
 * Statics
 **/
schema.statics.findAll = function (callback) {
    this
        .find()
        .lean()
        .exec(callback);
};

schema.statics.getById = function (id,populateLevel,callback) {
    this
        .findOne({_id: id})
        .lean()
        .exec(callback);
};

schema.statics.getByMission = function (missionId,callback) {
    nativeCollection.find(
        {
            'mission.$id' : missionId
        }
    ).toArray(callback)
};

schema.statics.addNewIncidentsPlan = function (incidentsPlan,callback) {

    //Mission reference
    var missionId = incidentsPlan.missionId;
    if (incidentsPlan.test) {
        incidentsPlan.mission = {
            $id : missionId
        }
    } else {
        incidentsPlan.mission = {
            $ref: 'Missions',
            $id : missionId,
            $db : 'UAS_MissionInput'
        }
    }
    delete incidentsPlan.missionId;

    nativeCollection.insert(
        incidentsPlan,
        callback
    );
};

/**
 * Compilation
 **/
var connection = baseRequire('/conf/DBConnections').get(dbConf.DWR.defaultConnectionName);
var collectionName = _.find(dbConf.DWR.collections,{'id' : 'IncidentPlans'}).name;
var nativeCollection = require('mongoskin').db(dbConf.DWR.getURL()).collection(collectionName);

connection.model(collectionName, schema, collectionName);
console.log(collectionName + ' model has been successfully compiled');

/**
 * Getter
 **/
exports.get = function () {
    return connection.model(collectionName);
};