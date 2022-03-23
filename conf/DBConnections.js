/**
 * Created by victor on 12/11/14.
 * Singleton
 */
var HashMap = require('hashmap').HashMap;   //Hashmap structure
var mongo = require('mongoskin');
var mongoose = require('mongoose');
var dbConf = baseRequire('/conf/dbConf');

var connections;
connections = new HashMap();

exports.newConnection = function (name, host, port, db) {
    connections.set(name,mongo.db('mongodb://' +    host + ':' +
                                                    port + '/' +
                                                    db,
                        {native_parser:true}));
};

exports.newMongooseConnection = function (name,host,port,db) {
    connections.set(name,mongoose.createConnection('mongodb://' +    host + ':' +
                                                                    port + '/' +
                                                                    db,
                                                                    {
                                                                        db : {native_parser:true}
                                                                    }));
    var newConnection = connections.get(name);

    //Define open-error-disconnect behaviours
    newConnection.on('connected', function() {
        var self = this;
        //Check if the data base is not empty (has any collection)
        this.db.collectionNames(function (err,names) {
            if (err) throw err;
            //TODO : Check if the collection names match the collection names expected
            if (names.length == 0) {
                throw 'Database [mongodb://' + self.host + ':' + self.port + '/' + self.name +  '] ' +
                'does not exists or has unexpected collections';
            }
            console.log('Connection to [mongodb://' + self.host + ':' + self.port + '/' + self.name +  '] was opened successfully');
        });
    });

    newConnection.on('error',function (err) {
        throw err;
    });

    newConnection.on('disconnected', function () {
        console.log('Disconnected from [mongodb://' + this.host + ':' + this.port + '/' + this.name +  ']');
    });
};

exports.get = function (name) {
    return connections.get(name);
};

exports.getUASMissionInputConnection = function () {
    return connections.get(dbConf.UAS_MissionInput.defaultConnectionName);
};

exports.initMongooseConnections = function () {
    this.newMongooseConnection(dbConf.UAS_MissionInput.defaultConnectionName,
        dbConf.UAS_MissionInput.host,
        dbConf.UAS_MissionInput.port,
        dbConf.UAS_MissionInput.db);

    this.newMongooseConnection(dbConf.UAS_MissionPlan.defaultConnectionName,
        dbConf.UAS_MissionPlan.host,
        dbConf.UAS_MissionPlan.port,
        dbConf.UAS_MissionPlan.db);

    this.newMongooseConnection(dbConf.UAS_Info.defaultConnectionName,
        dbConf.UAS_Info.host,
        dbConf.UAS_Info.port,
        dbConf.UAS_Info.db);

    this.newMongooseConnection(dbConf.DWR.defaultConnectionName,
        dbConf.DWR.host,
        dbConf.DWR.port,
        dbConf.DWR.db);

    this.newMongooseConnection(dbConf.UAS_Configuration.defaultConnectionName,
        dbConf.UAS_Configuration.host,
        dbConf.UAS_Configuration.port,
        dbConf.UAS_Configuration.db);
};

/**
 * Close all the database connections.
 * This function should be overloaded to accept different drivers and DBMS connections
 */
exports.closeConnections = function () {
    //Close all the hashmap connections
    connections.forEach(function (connection) {
        connection.close(function () {
            console.log('Connection to [mongodb://' + connection.host + ':' + connection.port + '/' + connection.name +  '] was closed successfully');
        });
    });
};