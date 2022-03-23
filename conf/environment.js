/**
 * Created by victor on 18/11/14.
 */

var _ = require('lodash');

//List of possible environments
//TODO: Incluir las colecciones de cada base de datos como parte de la configuración de cada environment?
var environments = [
    {
        id: 'Development',
        dbs : [
            {
                id : 'UAS_Configuration',
                host : 'aida.ii.uam.es',
                port : 27017,
                db : 'UAS_Configuration'
            },
            {
                id : 'UAS_Info',
                host : 'aida.ii.uam.es',
                port : 27017,
                db : 'UAS_Info'
            },
            {
                id : 'UAS_MissionInput',
                host : 'aida.ii.uam.es',
                port : 27017,
                db: 'UAS_MissionInput'
            },
            {
                id : 'UAS_MissionPlan',
                host : 'aida.ii.uam.es',
                port : 27017,
                db: 'UAS_MissionPlan'
            },
            {
                id : 'DWR',
                host : 'localhost',
                port : 27017,
                db : 'DroneWatchAndRescue'
            }
        ]
    },
    {
        id: 'Production',
        dbs : [
            {
                id : 'UAS_Configuration',
                host : 'aida.ii.uam.es',
                port : 27017,
                db : 'UAS_Configuration'
            },
            {
                id : 'UAS_Info',
                host : 'aida.ii.uam.es',
                port : 27017,
                db : 'UAS_Info'
            },
            {
                id : 'UAS_MissionInput',
                host : 'aida.ii.uam.es',
                port : 27017,
                db: 'UAS_MissionInput'
            },
            {
                id : 'UAS_MissionPlan',
                host : 'aida.ii.uam.es',
                port : 27017,
                db: 'UAS_MissionPlan'
            },
            {
                id : 'DWR',
                host : 'aida.ii.uam.es',
                port : 27017,
                db : 'DroneWatchAndRescue'
            }
        ]
    },
    {
        id: 'local',
        dbs : [
            {
                id : 'UAS_Configuration',
                host : 'localhost',
                port : 27017,
                db : 'UAS_Configuration'
            },
            {
                id : 'UAS_Info',
                host : 'localhost',
                port : 27017,
                db : 'UAS_Info'
            },
            {
                id : 'UAS_MissionInput',
                host : 'localhost',
                port : 27017,
                db: 'UAS_MissionInput'
            },
            {
                id : 'UAS_MissionPlan',
                host : 'localhost',
                port : 27017,
                db: 'UAS_MissionPlan'
            },
            {
                id : 'DWR',
                host : 'localhost',
                port : 27017,
                db : 'DroneWatchAndRescue'
            }
        ]
    },
    {
        id: 'StudentsData',
        dbs : [
            {
                id : 'UAS_Configuration',
                host : 'aida.ii.uam.es',
                port : 27017,
                db : 'UAS_Configuration'
            },
            {
                id : 'UAS_Info',
                host : 'aida.ii.uam.es',
                port : 27017,
                db : 'UAS_Info'
            },
            {
                id : 'UAS_MissionInput',
                host : 'aida.ii.uam.es',
                port : 27017,
                db: 'UAS_MissionInput'
            },
            {
                id : 'UAS_MissionPlan',
                host : 'aida.ii.uam.es',
                port : 27017,
                db: 'UAS_MissionPlan'
            },
            {
                id : 'DWR',
                host : 'localhost',
                port : 27017,
                db : 'StudentsData'
            }
        ]
    }
];

/**
 *
 * @param environmentId
 */
exports.getEnvironment = function (environmentId) {
  return _.find(environments,{id:environmentId});
};

exports.getDefaultEnvironment = function () {
    return this.getEnvironment('Development');
};
