/**
 * Created by victor on 12/11/14.
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
schema.statics.getById = function (id, populateLevel, callback) {
    this
        .findOne({_id : id})
        .lean()
        .exec(callback);
};

schema.statics.findAll = function (callback) {
    this
        .find()
        .lean()
        .exec(callback);
};

/**
 * Compilation
 **/
var connection = baseRequire('/conf/DBConnections').get(dbConf.UAS_Info.defaultConnectionName);
var collectionName = _.find(dbConf.UAS_Info.collections,{'id' : 'NoFlightZones'}).name;

connection.model(collectionName, schema, collectionName);
console.log(collectionName + ' model has been successfully compiled');

/**
 * Getter
 **/
exports.get = function () {
    return connection.model(collectionName);
};