/**
 * Created by victor on 11/11/14.
 */
var ConfigurationParameters = require('./ConfigurationParameters');
var _ = require('lodash');
var Environments = baseRequire('/conf/environment');
var environment = Environments.getEnvironment(ConfigurationParameters.environment);

function getEnvironmentDBConfParameter (dbId,parameterName) {

    var dbConf = _(environment.dbs).find({id:dbId});

    if (dbConf !=null && _.has(dbConf,parameterName)) {
        return dbConf[parameterName];
    }
    else return null;
}

module.exports = {
    UAS_MissionInput : {
        host: getEnvironmentDBConfParameter('UAS_MissionInput','host') || 'aida.ii.uam.es',
        port: getEnvironmentDBConfParameter('UAS_MissionInput','port') || 27017,
        db: getEnvironmentDBConfParameter('UAS_MissionInput','db') || 'UAS_MissionInput',
        defaultConnectionName: 'UAS_MissionInput_defaultConnection',
        collections : [
            {
                id : 'MissionInputs',
                name : 'Missions'
            }
        ],
        getURL: function () {
            return 'mongodb://' +
                this.host +
                ':' +
                this.port +
                '/' +
                this.db;
        }
    },
    UAS_MissionPlan: {
        host: getEnvironmentDBConfParameter('UAS_MissionPlan','host') || 'aida.ii.uam.es',
        port: getEnvironmentDBConfParameter('UAS_MissionPlan','port') || 27017,
        db: getEnvironmentDBConfParameter('UAS_MissionPlan','db') || 'UAS_MissionPlan',
        defaultConnectionName: 'UAS_MissionPlan_defaultConnection',
        collections : [
            {
                id : 'MissionPlans',
                name : 'Plans'
            }
        ],
        getURL: function () {
            return 'mongodb://' +
                this.host +
                ':' +
                this.port +
                '/' +
                this.db;
        }
    },
    UAS_Info : {
        host: getEnvironmentDBConfParameter('UAS_Info','host') || 'aida.ii.uam.es',
        port: getEnvironmentDBConfParameter('UAS_Info','port') || 27017,
        db: getEnvironmentDBConfParameter('UAS_Info','db') || 'UAS_Info',
        defaultConnectionName: 'UAS_Info_defaultConnection',
        collections : [
            {
                id : 'Airports',
                name : 'Airports'
            },
            {
                id: 'GCSs',
                name: 'GCSs'
            },
            {
                id: 'NoFlightZones',
                name: 'NoFlightZones'
            },
            {
                id: 'RefuelingZones',
                name: 'RefuelingZones'
            },
            {
                id : 'Sensors',
                name: 'Sensors'
            },
            {
                id: 'UAVs',
                name: 'UAVs'
            }
        ],
        getURL: function () {
            return 'mongodb://' +
                this.host +
                ':' +
                this.port +
                '/' +
                this.db;
        }
    },
    UAS_Configuration: {
        host: getEnvironmentDBConfParameter('UAS_Configuration','host') || 'aida.ii.uam.es',
        port: getEnvironmentDBConfParameter('UAS_Configuration','port') || 27017,
        db: getEnvironmentDBConfParameter('UAS_Configuration','db') || 'UAS_Configuration',
        defaultConnectionName: 'UAS_Configuration_defaultConnection',
        collections : [
            {
                id: 'ObjectiveTypes',
                name: 'ObjectiveTypes'
            },
            {
                id: 'TaskTypes',
                name: 'TaskTypes'
            }
        ],
        getURL: function () {
            return 'mongodb://' +
                this.host +
                ':' +
                this.port +
                '/' +
                this.db;
        }
    },
    DWR: {
        host: getEnvironmentDBConfParameter('DWR','host') || 'aida.ii.uam.es',
        port: getEnvironmentDBConfParameter('DWR','port') || 27017,
        db: getEnvironmentDBConfParameter('DWR','db') || 'DroneWatchAndRescue',
        defaultConnectionName: 'DWR_defaultConnection',
        collections : [
            {
                id: 'IncidentPlans',
                name: 'IncidentPlans'
            },
            {
                id: 'ScenaryScheduler',
                name: 'ScenaryScheduler'
            },
            {
                id: 'simulations',
                name: 'simulations'
            },
            {
                id: 'simulationSnapshots',
                name: 'simulationSnapshots'
            },
            {
                id: 'droneSnapshots',
                name: 'droneSnapshots'
            }
        ],
        getURL: function () {
            return 'mongodb://' +
                    this.host +
                    ':' +
                    this.port +
                    '/' +
                    this.db;
        }
    }
};
