/**
 * Created by victor on 11/11/14.
 * DB Data Entry Module (Singleton)
 */

//Requires
var _ = require('lodash');
var Area = projRequire('/areas/Area');
var AreaAirport = projRequire('/world/AreaAirport');
var DangerAreaIncident = projRequire('/incidents/DangerAreaIncident');
var PayloadIncident = projRequire('/incidents/PayloadIncident');
var Drone = projRequire('/drones/Drone');
var FlightArea = projRequire('/areas/FlightArea');
var util = require('util');
var LogLevels = projRequire('/logger/LogLevels');
var DEMHelpers = require('./DEMHelpers');
var GameplayLogger = projRequire('/logger/GameplayLogger');
var GCS = projRequire('/world/GCS');
var Rectangle = projRequire('/utils/Rectangle');
var Surveillance = projRequire('/tasks/Surveillance');

//Models
var missionPlanModel = baseRequire('/API/models/UAS_MissionPlan/Plans').get();
var scenarySchedulerModel = baseRequire('/API/models/DWR/ScenaryScheduler').get();

//Default Coordinate converter
var defaultCoordConverter = DEMHelpers.fromLatLonToXYInKm;

/**
 *
 * @param scenarySchedulerId
 * @param gameplay
 * @param callback
 */
exports.loadScenaryScheduler = function (scenarySchedulerId,gameplay,options,callback) {
    if (!gameplay) callback('Bad parameters',null);

    //Load the scenary scheduler
    scenarySchedulerModel.getById(scenarySchedulerId,-1,function (err,ss) {
        if (err) callback(err,null);

        //SS not found
        if (!ss) {
            callback(null,null);
            return;
        }

        //Load the incidents plan
        loadIncidentsPlan(ss.incidentsPlan,gameplay,options);

        //TODO: Load interaction's guide

        // TODO: Return the modified gameplay in the callback?
        callback(null,gameplay);
    });

};

/**
 *
 * @param missionPlanId
 * @param gameplay
 * @param callback
 */
exports.loadMissionPlan = function (missionPlanId, gameplay, callback) {
    if (!missionPlanId || !gameplay) callback('Bad Parameters',null);

    missionPlanModel.getById(missionPlanId,-1,function (err,plan) {
        if (err) {
            callback(err,null);
            return;
        }
        if (plan == null) {
            callback('No mission plan found for ID: ' + missionPlanId,null);
            return;
        }
        GameplayLogger.get(gameplay.id).log('Mission plan has been retrieved successfully',LogLevels.DEBUG);

        //Environment
        loadEnvironment(plan.mission,gameplay);

        //Plan
        loadPlan(plan,gameplay);

        callback(null,gameplay.gameStatus);
    });
};

/**
 * AUXILIAR Load FUNCTIONS
 */
function loadIncidentsPlan(incidentsPlan,gameplay,options) {

    var coordConverter = (options && options.coordConverter)
        ?   options.coordConverter
        :   defaultCoordConverter;

    //Danger Area incidents
    _(incidentsPlan.incidents)
        .filter(function (incident) {return incident.type == 'DangerArea'})
        .forEach(function (dangerAreaIncident) {

            //Creates the area TODO: Volume?
            var area = new Area(
                dangerAreaIncident._id,
                _(dangerAreaIncident.area.points)
                    .map(function (point) {return coordConverter(point)})
                    .value()
            );

            gameplay.addNewIncident(new DangerAreaIncident(
                dangerAreaIncident._id,
                gameplay.id,
                dangerAreaIncident.startTime*1000, //Seconds->milliseconds
                dangerAreaIncident.endTime*1000, // Seconds -> milliseconds
                area,
                {
                    level: dangerAreaIncident.level,
                    message : dangerAreaIncident.message
                }
            ));
        });

    //Payload incidents
    _(incidentsPlan.incidents)
        .filter(function (incident) {return incident.type == 'PayloadIncident'})
        .forEach(function (payloadIncident) {

            var drone = _(gameplay.gameStatus.drones).find({id : payloadIncident.droneId});
            if (!drone) {
                GameplayLogger.get(gameplay.id).log('Error loading Payload incident [' + payloadIncident._id + '] : Associated drone' +
                '[' + payloadIncident.droneId + '] not found in this simulation', LogLevels.ERROR);
            } else {
                gameplay.addNewIncident(new PayloadIncident(
                    payloadIncident._id,
                    gameplay.id,
                    payloadIncident.startTime*1000, //Seconds->milliseconds
                    drone,
                    {
                        level: payloadIncident.level,
                        message : payloadIncident.message
                    }
                ));
            }
        });

    GameplayLogger.get(gameplay.id).log('Incidents plan successfully loaded');
}

/**
 * Analyse the mission plan input and load the simulation waypoints and tasks
 * @param missionPlan
 * @param gameplay
 */
function loadPlan(missionPlan,gameplay,options) {

    var gameStatus = gameplay.gameStatus;   //shortcut
    var coordConverter = (options && options.coordConverter)
        ?   options.coordConverter
        :   defaultCoordConverter;

    //Create tasks task to its associated UAV
    _(missionPlan.objectives).forEach(function (objective) {
        _(objective.tasks).forEach(function (task) {
            //1. Search the flight area associated to this task
            var flightArea = _(gameStatus.flightAreas).find({id: task.zone.zone_id});
            if (!flightArea) {
                GameplayLogger.get(gameplay.id).log('[DataEntryModule] - [ERROR] - The task [' + task.tasks_id + '] has an associated ' +
                'zone [' + task.zone.zone_id + '], but the zone does not exists',
                    LogLevels.ERROR)
            } else {
                //2.Create the Task
                //TODO: Now all the tasks are modeled as surveillance tasks!!!
                var newTask = new Surveillance(
                    task.tasks_id,
                    gameplay.id,
                    flightArea,
                    {
                        type: task.TaskTypes_id
                    }
                );

                /*3. Create the waypoint associated to that UAV and area and link it to the assigned drone
                 We create two waypoints, one associated to the entry point and start time, and another one associated to
                 the end of the task*/
                var uav = _(gameStatus.drones).find({id: task.UAVs_id});
                if (!uav) {
                    GameplayLogger.get(gameplay.id).log(
                        '[DataEntryModule] - The task [' + task.tasks_id + '] is assigned to the UAV [' + task.UAVs_id + '], but' +
                        ' that UAV does not exists.',
                        LogLevels.ERROR)
                }
                else {
                    //TODO : Include Flight profiles as Waypoint speed?
                    uav.appendWaypoint(
                        flightArea.entryPoint,
                        {
                            time: DEMHelpers.inputTimeToWaypointTime(task.start_time), //Real Hours -> Simulation milliseconds
                            task : newTask,
                            type : newTask.type
                        }
                    );
                    //End waypoint -> Default type (ROUTE)
                    uav.appendWaypoint(
                        flightArea.exitPoint,
                        {
                            time : DEMHelpers.inputTimeToWaypointTime(task.end_time)
                        }
                    );
                }
            }
        });
    });

    //Once the objective tasks has been transformed in drone waypoints, we must sort the waypoints according to the
    // time schedule
    //TODO: Implement this

    GameplayLogger.get(gameplay.id).log('Mission plan successfully loaded',LogLevels.INFO);
};


function loadEnvironment(missionInput,gameplay, options) {
    var gameStatus = gameplay.gameStatus;   //Shortcut
    var coordConverter = (options && options.coordConverter)
        ?   options.coordConverter
        :   defaultCoordConverter;

    //World
    var upperLeftBound = coordConverter(missionInput.scenary.bounds.upper_left);
    var downRightBound = coordConverter(missionInput.scenary.bounds.down_right);
    gameStatus.world = new Rectangle(upperLeftBound.x,
                                    upperLeftBound.y,
                                    Math.abs(downRightBound.x-upperLeftBound.x),
                                    Math.abs(downRightBound.y-upperLeftBound.y)
                            );

    gameStatus.sea = gameStatus.world;

    GameplayLogger.get(gameplay.id).log('World bounds : (x = ' + gameStatus.world.x +
    ', y = ' + gameStatus.world.y +
    ', width = ' + gameStatus.world.width +
    ' km, height = ' + gameStatus.world.height +' km)', LogLevels.DEBUG);

    //Flight zones (Objective zones)
    gameStatus.flightAreas = [];
    _(missionInput.objectives).forEach(function (objective) {
        gameStatus.flightAreas.push(new FlightArea(
                                        objective.zone.zone_id,
                                        _(objective.zone.area.points)
                                            .map(function (point) {return coordConverter(point)})
                                            .value(),
                                        coordConverter(objective.zone.entry_point),
                                        coordConverter(objective.zone.exit_point)
                                    ));
    });

    //No Flight Zones (Only cylinder volumes)
    /*
    gameStatus.noFlightAreas = [];
    _(missionInput.scenary.no_flight_zones).forEach(function (noFlightZone) {
       if (noFlightZone.volume.type == 'cylinder') {
            gameStatus.noFlightAreas.push(new Area( noFlightZone.NoFlightZones_id,
                                                    _(noFlightZone.volume.area.points)
                                                    .map(function (point) {return coordConverter(point)})
                                                    .value()
                                                )
                                        );
       }
    });
    */

    //Corridors (Only cylinder volumes)
    gameStatus.corridors = [];
    /*
    _(missionInput.scenary.corridors).forEach(function (corridor) {
        if (corridor.volume.type == 'cylinder') {
            gameStatus.corridors.push(new Area(corridor._id,
                                                _(corridor.volume.area.points)
                                                    .map(function (point) {return coordConverter(point)})
                                                    .value()
                                                ));
        }
    });
    */

    gameStatus.airports = [];
    _(missionInput.scenary.airports).forEach(function (airport) {
        if (airport.area.type == 'polygon') {
            gameStatus.airports.push(new AreaAirport(
                airport._id,
                _(airport.area.points).map(function (point) {return coordConverter(point)}).value(),
                {
                    name: airport.name,
                    runawayLength: airport.runaway_length,
                    launcherType : airport.launcher_type
                }
            ));
        }
    });

    //GCS's
    gameStatus.gcss = [];
    _(missionInput.scenary.gcss).forEach(function (gcs) {
        gameStatus.gcss.push(new GCS(
                gcs._id,
                coordConverter(gcs.position),
                {
                    name: gcs.name,
                    maxUAVs: gcs.max_uavs,
                    withinRange: gcs.within_range
                }
            )
        );
    });

    //Drones
    gameStatus.drones = [];
    var newDrone;
    _(missionInput.scenary.uavs).forEach(function (uav) {
        newDrone = new Drone(   uav.UAVs_id,
                                gameplay.id,
                                {
                                    name : uav.name,
                                    position: coordConverter(uav.position),
                                    minAltitude: uav.min_altitude,
                                    maxAltitude: uav.max_altitude,
                                    minSpeed: uav.min_speed,
                                    maxSpeed: uav.max_speed,
                                    maxFlightTime: uav.max_flight_time,
                                    communicationRange: uav.within_range,
                                    fuelCapacity: uav.max_fuel,
                                    fuel: uav.fuel
                                }
                            );

        //TODO: Add drone sensors?
        gameStatus.drones.push(newDrone);
    });

    GameplayLogger.get(gameplay.id).log('Mission scenary successfully loaded');
};


