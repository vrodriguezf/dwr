/**
 * Created by victor on 14/11/14.
 */
/**
 * Created by victor on 12/11/14.
 */
var _ = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dbConf = baseRequire('/conf/dbConf');

/**
 * Model dependencies
 */
var incidentPlansModel = baseRequire('/API/models/DWR/IncidentPlans').get();
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
    if (populateLevel == null || populateLevel ==0) {
        this
            .findOne({_id : id})
            .lean()
            .exec(generalCallback);
    } else {
        var nextPopulationLevel = (populateLevel > 0) ? populateLevel-1 : populateLevel;
        this
            .findOne({_id: id})
            .lean()
            .exec(function (err,ss) {
                if (err) generalCallback(err,null);
                if (!ss) {
                    generalCallback(null,null);
                    return;
                }
                //POPULATION
                //Incidents plan
                incidentPlansModel.getById(ss.incidentsPlan.oid,nextPopulationLevel,function (err,incidentsPlan) {
                    if (err) generalCallback(err,null);
                    _.assign(ss.incidentsPlan,incidentsPlan);
                    generalCallback(null,ss);
                });
            });
    }

};

schema.statics.getByMission = function (missionId,callback) {
    nativeCollection.find(
        {
            'mission.$id' : missionId
        }
    ).toArray(callback)
};

schema.statics.findAll = function (callback) {
    this
        .find()
        .lean()
        .exec(callback);
};

//Inserting using Mongoskin driver
schema.statics.insertOrUpdate = function (id,missionId,incidentsPlanId,interactionsGuideId,callback) {
    nativeCollection.insert(
        {
            _id : id,
            mission : {
                $ref: 'Missions',
                $id : missionId
            },
            incidentsPlan: {
                $ref: 'IncidentPlans',
                $id : incidentsPlanId
            },
            interactionsGuide: {
                $ref: 'simulations',
                $id : interactionsGuideId
            }
        },
        function (err,result) {
            if (err) {
                //Si el elemetno ya existe se actualiza
                //TODO: Ver exactamente el error, no suponer que siempre es el de duplicado
                nativeCollection.updateById(id,
                {
                    mission : {
                        $ref: 'Missions',
                        $id : missionId
                    },
                    incidentsPlan: {
                        $ref: 'IncidentPlans',
                        $id : incidentsPlanId
                    },
                    interactionsGuide: {
                        $ref: 'simulations',
                        $id : interactionsGuideId
                    }
                },
                callback);
            } else {
                callback(null,result);
            }
        });
};

/**
 * Compilation
 **/
var connection = baseRequire('/conf/DBConnections').get(dbConf.DWR.defaultConnectionName);
var collectionName = _.find(dbConf.DWR.collections,{'id' : 'ScenaryScheduler'}).name;
var nativeCollection = require('mongoskin').db(dbConf.DWR.getURL()).collection(collectionName);

connection.model(collectionName, schema, collectionName);
console.log(collectionName + ' model has been successfully compiled');

/**
 * Getter
 **/
exports.get = function () {
    return connection.model(collectionName);
};