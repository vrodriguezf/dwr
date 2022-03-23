/**************************************************
 ** GAMEPLAY CLASS
 **************************************************/

/**
 * Module dependencies.
 */
var _ = require('lodash');
var extend = require('util')._extend;
var fs = require('fs');
var util = require('util');

var Area = projRequire('/areas/Area');
var Camera = projRequire('/payload/Camera');
var Constants = projRequire('/Constants');
var ConfigurationParameters = baseRequire('/conf/ConfigurationParameters');
var ControlModes = require('./controlModule/ControlModes');
if (ConfigurationParameters.useDB) {
    var DBDataEntryModule = projRequire('/dataEntryModule/DBDataEntryModule');
}
var DataEntryModule = require('./dataEntryModule/DataEntryModule');
var DEMHelpers = projRequire('/dataEntryModule/DEMHelpers');
var DEMStatuses = projRequire('/dataEntryModule/DEMStatuses');
var DRM = require('./drm/DRM');
var DangerAreaIncident = require('./incidents/DangerAreaIncident');
var Drone = projRequire('/drones/Drone');
var DroneStatus = require('./drones/DroneStatus');
var EnemyShip = projRequire('/ships/EnemyShip');
var FlightArea = projRequire('/areas/FlightArea');
var FuelStation = projRequire('/world/FuelStation');
var GameplayLogger = projRequire('/logger/GameplayLogger');
var GameplayLogic = require('./GameplayLogic');
var Helpers = projRequire('/utils/helpers');
var HumanShip = require('./ships/HumanShip');
var IncidentStatus = require('./incidents/IncidentStatus');
var LogLevels = projRequire('/logger/LogLevels');
var Radar = projRequire('/payload/Radar');
var Rectangle = projRequire('/utils/Rectangle');
var PayloadIncident = require('./incidents/PayloadIncident');
var Refueling = projRequire('/tasks/Refueling');
if (ConfigurationParameters.useDB)  {
    var ScenarySchedulerModel = baseRequire('/API/models/DWR/ScenaryScheduler').get();
}
var Sensor = require('./payload/Sensor');
var Ship = require('./ships/Ship');
var SnapshotCauses = require('../shared/snapshotCauses');
var Surveillance = projRequire('/tasks/Surveillance');
var UserInputs = require('../shared/userInputs');
/**
 * Shared variables & constants
 */

// CONSTRUCTOR
function Gameplay(id, socket) {

    //Gameplay variables
    this.id = id;
    this.socket = socket;

    //Simulation mode : [Default(null), SetInteractionsGuide]
    this.mode = null;

    //Gameplay entry data
    this.importedMissionPlan = null;
    this.importedScenaryScheduler = null;
    this.importedTargetsDefinition = null;

    //GAMEPLAY STATUS -- This object is sent to the client every game update
    this.gameStatus = {
        airports: [],
        fuelStations: [],
        corridors: [],
        drones: [],
        incidents: [],
        flightAreas: [],
        noFlightAreas: [],
        ships: [],
        controlMode: ControlModes.MONITORING,
        statistics: {
            captured: 0,
            targetsTotalCount: 0,
            rescued: 0,
            inCoast: 0
        },
        selectedDrone: null,
        log: [],	//Stores update log messages (Cleared after each update)
        test: true, //Set if the mission to simulate is a test mission or not
        time: {
            simulationTimeRatio: 1, 	//Ratio between real time and simulation time
            elapsedTime: 0,
            total: 0,
            simulationElapsedTime: 0,
            simulationTotal: 0
        }
    };

    this.remainingIncidents = [];
    this.inputs = [];
    this.gameStarted = false;

    //Automatically increases this counter to give ids to new game elements
    this.idCounters = {
        incidents: 0
    };

    //Data entry module TODO: This could be a SingleTon?!!
    this.DEM = new DataEntryModule(this.id);

    //Socket communication
    this.attachSocketHandlers();

}

/**
 * Init the game status and send it to the client (Needs useDB = TRUE for real missions)
 * @param initParams
 */
Gameplay.prototype.initRealMission = function (initParams) {
    /**
     * Load the mission plan from the database
     */
    this.gameStatus.test = false;
    var self = this;
    //1. Load the mission plan
    if (initParams.missionPlanId != null) {
        DBDataEntryModule.loadMissionPlan(initParams.missionPlanId, this, function (err, result) {
            if (err) {
                this.log('Error loading the mission plan: ' + err, LogLevels.ERROR);
                return;
            }
            self.importedMissionPlan = {
                id: initParams.missionPlanId,
                test: false
            };

            //2. Load the mission Scenary scheduler (Incidents plan + interactions guide)
            // or creates a new one in the case of simulationMode: 'SetInteractionsGuide'
            if (self.mode == 'setInteractionsGuide') {

            }

            DBDataEntryModule.loadScenaryScheduler(initParams.scenarySchedulerId, self, null, function (err, result) {
                if (err) {
                    self.log('Error loading the scenary scheduler: ' + err, LogLevels.ERROR);
                }

                self.importedScenaryScheduler = {
                    id: initParams.scenarySchedulerId,
                    test: false
                };

                //Send the initialized game
                self.socket.emit('server-gameInit', self.gameStatus);
                self.start(initParams);
            });
        });
    }
};

// INIT&SEND GAME STATUS FROM FILES
Gameplay.prototype.initTestMission = function (initParams) {

    var environment = null;
    var initError = false;
    var demStatus;

    this.gameStatus.test = true;

    //Load the environment
    demStatus = this.DEM.loadEnvironment(initParams.environmentFilePath, this.gameStatus);
    if (demStatus.status == DEMStatuses.OK) {
        //this.importedEnvironment.id = demStatus.fileID;
    }
    else {
        this.log('Init error - environment file [' + demStatus.description + ']', LogLevels.ERROR);
        initError = true;
    }

    /************************
     * TARGETS (SHIPS)
     ************************/
    demStatus = this.DEM.loadTargets(initParams.targetsFilePath, this.gameStatus);
    if (demStatus.status == DEMStatuses.OK) {
        this.importedTargetsDefinition = {
            id: demStatus.fileID,
            test: true
        };
    }
    else {
        this.log('Init error - targets file [' + demStatus.description + ']', LogLevels.ERROR);
        initError = true;
    }

    /**********************
     * PLANNER
     **********************/
    demStatus = this.DEM.loadPlan(initParams.plansFilePath, this.gameStatus);
    if (demStatus.status == DEMStatuses.OK) {
        this.importedMissionPlan = {
            id: demStatus.fileID,
            test: true
        }
    }
    else {
        this.log('Init error - Plans file [' + demStatus.description + ']', LogLevels.ERROR);
        initError = true;
    }

    /***********************************************
     * Scenary Scheduler (From DataBase Only)
     ***********************************************/
    if (!ConfigurationParameters.useDB) {
        //Send the initialized game
        this.socket.emit('server-gameInit', this.gameStatus);

        //When the initialization ends, the game logic starts (game loop)
        // TODO : The client chooses when the game starts!
        if (!initError) {
            this.start(initParams);
        }
    }
    else {
        var self = this;
        self.mode = initParams.mode;
        if (self.mode == 'setInteractionsGuide') {
            //Creates the scenary scheduler and load it
            ScenarySchedulerModel.insertOrUpdate
            (initParams.scenarySchedulerId,
                initParams.missionPlanId,
                initParams.incidentsPlanId,
                null,
                function (err, result) {
                    if (err) throw err;
                    self.log('Scenary scheduler [' + initParams.scenarySchedulerId + '] was successfully saved',LogLevels.DEBUG);
                    DBDataEntryModule.loadScenaryScheduler(initParams.scenarySchedulerId, self, {coordConverter: DEMHelpers.identity}, function (err, result) {
                        //Assign the imported variables (Entry module)
                        self.importedScenaryScheduler = {
                            id: initParams.scenarySchedulerId,
                            test: true
                        };

                        //Send the initialized game
                        self.socket.emit('server-gameInit', self.gameStatus);

                        //When the initialization ends, the game logic starts (game loop)
                        // TODO : The client chooses when the game starts!
                        if (!initError) {
                            self.start(initParams);
                        }
                    });
                })
        } else {
            //Load the existing Scenary Scheduler
            DBDataEntryModule.loadScenaryScheduler(initParams.scenarySchedulerId, this, {coordConverter: DEMHelpers.identity}, function (err, result) {
                //Assign the imported variables (Entry module)
                self.importedScenaryScheduler = {
                    id: initParams.scenarySchedulerId,
                    test: true
                };

                //Send the initialized game
                self.socket.emit('server-gameInit', self.gameStatus);

                //When the initialization ends, the game logic starts (game loop)
                // TODO : The client chooses when the game starts!
                if (!initError) {
                    self.start(initParams);
                }
            });
        }
    }
};

//Gameplay socket handlers
Gameplay.prototype.attachSocketHandlers = function () {

    var self = this;	// To use the gameplay class and use it in the callbacks

    this.socket.on('client-input', function (inputsParam) {

        inputArray = [];

        if (!inputsParam.length) {
            GameplayLogger.get(self.id).log('Input received' + inputsParam, LogLevels.DEBUG);
            inputArray.push(inputsParam);
            self.inputs = inputArray;
        } else {
            //Array
            for (var i = 0; i < inputsParam.length; i++) {
                GameplayLogger.get(self.id).log('Input received' + inputsParam, LogLevels.DEBUG);
            }
            self.inputs = inputsParam;
        }
    });
}

Gameplay.prototype.handleInput = function (input) {

    if (!input) {
        return;
    }

    if (input.name == Constants.input.addWaypoint.name) {

        //Get the drone in movement
        var droneToMove = Helpers.getDroneById(this.gameStatus.drones, input.params.droneId);

        if (!droneToMove) return;

        droneToMove.addWaypoint(input.params.waypoint.x,
            input.params.waypoint.y,
            input.params.index,
            input.params.waypoint);

        DRM.get(this.id).takeSimulationSnapshot(SnapshotCauses.USER_INPUT, {
            inputId: UserInputs.CHANGE_DRONE_PATH,
            droneId: droneToMove.id
        });
        this.log('Waypoint (' + input.params.waypoint.x + ',' + input.params.waypoint.y + ') added to drone ' + input.params.droneId);
    }
    else if (input.name == Constants.input.setPath.name) {
        var drone = Helpers.getDroneById(this.gameStatus.drones, input.params.droneId);

        if (!drone) return;

        drone.setPath(input.params.waypoints);

        DRM.get(this.id).takeSimulationSnapshot(SnapshotCauses.USER_INPUT, {
            inputId: UserInputs.CHANGE_DRONE_PATH,
            droneId: drone.id
        });
        this.log('Drone ' + input.params.droneId + ' has changed his flying path');
    }
    else if (input.name == Constants.input.selectDrone.name) {

        var drone = Helpers.getDroneById(this.gameStatus.drones, input.params.droneId);

        this.gameStatus.selectedDrone = drone || null;
        this.gameStatus.controlMode = ControlModes.MONITORING;

        //Register event (Log + DRM)
        DRM.get(this.id).takeSimulationSnapshot(SnapshotCauses.USER_INPUT, {
            inputId: UserInputs.SELECT_DRONE,
            droneId: ((drone != null) ? drone.id : null)
        });
        this.log((drone!=null) ?
                'Drone ' + input.params.droneId + ' selected '
                :'Drones unselected');
    }
    else if (input.name == Constants.input.setSpeed.name) {
        var drone = Helpers.getDroneById(this.gameStatus.drones, input.params.droneId);

        if (!drone) return;

        drone.speed = input.params.value;

        DRM.get(this.id).takeSimulationSnapshot(SnapshotCauses.USER_INPUT, {
            inputId: UserInputs.SET_DRONE_SPEED,
            droneId: drone.id
        });
        this.log('Drone ' + input.params.droneId + ' speed set to ' + input.params.value + ' km/h');
    }
    else if (input.name == 'setWaypoint') {
        var drone = Helpers.getDroneById(this.gameStatus.drones, input.params.droneId);

        if (!drone) return;

        drone.setWaypoint(input.params.waypointId, input.params.waypoint);

        DRM.get(this.id).takeSimulationSnapshot(SnapshotCauses.USER_INPUT, {
            inputId: UserInputs.CHANGE_DRONE_PATH,
            droneId: drone.id
        });
        this.log('Waypoint ' + input.params.waypointId + ' from drone ' + input.params.droneId + ' set to (' +
        input.params.waypoint.x + ',' + input.params.waypoint.y + ')');
    }
    else if (input.name == 'setSimulationTimeRatio') {
        this.gameStatus.time.simulationTimeRatio = input.params.simulationTimeRatio;

        DRM.get(this.id).takeSimulationSnapshot(SnapshotCauses.USER_INPUT, {inputId: UserInputs.SET_SIMULATION_TIME_RATIO});
        this.log('Simulation time ratio = x' + input.params.simulationTimeRatio);
    }
    else if (input.name == 'setWaypointSelection') {

        var drone = Helpers.getDroneById(this.gameStatus.drones, input.params.droneId);

        if (!drone) return;

        drone.setWaypointSelection(input.params.waypointId, input.params.selected);

        DRM.get(this.id).takeSimulationSnapshot(SnapshotCauses.USER_INPUT, {
            inputId: UserInputs.SET_WAYPOINT_SELECTION,
            selected: input.params.selected
        });
        this.log('Waypoint ' + input.params.waypointId +
        ' from drone ' + input.params.droneId +
        ' has been ' + ((input.params.selected == true) ? ' selected' : ' unselected'));
    }
    else if (input.name == 'setControlMode') {
        var controlMode = _.find(ControlModes, {'id': input.params.controlModeId});
        if (!controlMode) {
            this.log('Trying to change control mode to ' + input.params.controlModeId + '. Not recognized', LogLevels.DEBUG);
            return;
        }

        this.setControlMode(controlMode);
        //Register the event
        DRM.get(this.id).takeSimulationSnapshot(SnapshotCauses.USER_INPUT, {
            inputId: UserInputs.SET_CONTROL_MODE,
            controlMode: controlMode
        });
    }
    else {
        this.log('Command received but not recognized', LogLevels.ERROR);
    }
}

Gameplay.prototype.setControlMode = function (controlMode) {
    this.gameStatus.controlMode = controlMode;

    //Register event (Log & DRM??) TODO: Think about DRM; here
    this.log('Control mode set to [' + controlMode.key + ']', LogLevels.INFO);
}

/**
 * Add new incidents
 * @param newIncident
 */
Gameplay.prototype.addNewIncident = function (newIncident) {

    // TODO: Check if the incident is well-constructed?

    //If the incident is not scheduled, assign it a new id
    this.idCounters.incidents++;
    if (newIncident.id == null)
        newIncident.id = this.idCounters.incidents;

    this.remainingIncidents.push(newIncident);
}

/*
 * Access the gameplay logger ( global variables ) and adds a log message (Server and client)
 */
Gameplay.prototype.log = function (text, level) {

    GameplayLogger.get(this.id).log(text, level);
}

//Update the game every game tick
Gameplay.prototype.update = function (gameTime) {

    //Check if there have been any player input
    var lastInput = this.inputs.pop();
    this.inputs = [];	//Reset inputs

    //Handle the input properly
    this.handleInput(lastInput, this.gameStatus);

    /*******************
     * PRE-UPDATE PHASE ( Clean & Filter)
     *******************/

    //Clean the select drone field, if the drone has dead
    if (this.gameStatus.selectedDrone != null && this.gameStatus.selectedDrone.status == DroneStatus.DEAD) {
        this.gameStatus.selectedDrone = null;
    }

    //Filter drones
    this.gameStatus.drones = this.gameStatus.drones.filter(function (drone) {
        return (drone.remainingFuel > 0 && drone.status != DroneStatus.DEAD);
    });

    this.gameStatus.ships = this.gameStatus.ships.filter(function (ship) {
        return !ship.inCoast && !ship.detected;
    });

    //incidents filters
    this.gameStatus.incidents = this.gameStatus.incidents.filter(function (incident) {
        return incident.status == IncidentStatus.ACTIVE;
    });
    this.remainingIncidents = this.remainingIncidents.filter(function (incident) {
        return (incident.status != IncidentStatus.ACTIVE);
    });

    /*******************
     * UPDATE PHASE
     *******************/
    //Update drones
    for (var i = 0; i < this.gameStatus.drones.length; i++) {
        this.gameStatus.drones[i].update(gameTime);
    }

    //Update ships
    for (var i = 0; i < this.gameStatus.ships.length; i++) {
        this.gameStatus.ships[i].update(gameTime);
        if (this.gameStatus.ships[i].inCoast) {
            this.gameStatus.statistics.inCoast++;
        }
    }

    //Update incidents & check for new incidents to start
    for (var i = 0; i < this.gameStatus.incidents.length; i++) {
        this.gameStatus.incidents[i].update(gameTime);
    }
    for (var i = 0; i < this.remainingIncidents.length; i++) {
        if (gameTime.simulationTotal >= this.remainingIncidents[i].startTime) {
            this.remainingIncidents[i].start();
            this.gameStatus.incidents.push(this.remainingIncidents[i]);
        }
    }

    //Update client log
    this.gameStatus.log = GameplayLogger.get(this.id).getAndRefreshClientLog();

    /*******************
     * POST-UPDATE PHASE
     *******************/
    for (var i = 0; i < this.gameStatus.drones.length; i++) {

        var droneInLoop = this.gameStatus.drones[i];

        //Check drone collision with No Flight areas
        for (var j = 0; j < this.gameStatus.noFlightAreas.length; j++) {
            if (GameplayLogic.checkDroneCollision(droneInLoop, this.gameStatus.noFlightAreas[j]) == true) {
                droneInLoop.kill();
            }
        }
        //Check drone collision with danger areas
        var dangerAreaIncidents = this.gameStatus.incidents.filter(function (incident) {
            return (incident.type == 'DangerAreaIncident');
        });
        for (j = 0; j < dangerAreaIncidents.length; j++) {
            if (GameplayLogic.checkDroneCollision(droneInLoop, dangerAreaIncidents[j].area) == true) {
                droneInLoop.kill();
            }
        }

        //Check ship detection
        for (var j = 0; j < this.gameStatus.ships.length; j++) {
            var currentShip = this.gameStatus.ships[j];
            var shipDetected = droneInLoop.detect(currentShip.position.x,
                currentShip.position.y);
            if (shipDetected) {
                currentShip.setDetected(true);
                if (currentShip instanceof EnemyShip) {
                    this.gameStatus.statistics.captured++;
                    this.log('Target detected in (' + Helpers.round(currentShip.position.x, 2) + ',' +
                    Helpers.round(currentShip.position.y, 2) +
                    '). Type = EnemyShip');
                }
                else if (currentShip instanceof HumanShip) {
                    this.gameStatus.statistics.rescued++;
                    this.log('Target detected in (' + currentShip.position.x + ',' + currentShip.position.y + '). Type = HumanShip');
                }
                else {
                    this.log('Target detected in (' + currentShip.position.x + ',' + currentShip.position.y + '). Type = Not recognized');
                }

                //Register this event taking a simulation snapshot
                DRM.get(this.id).takeSimulationSnapshot(SnapshotCauses.TARGET_DETECTED, {
                    targetPosition: [currentShip.position.x, currentShip.position.y],
                    detectorId: droneInLoop.id
                });
            }
        }
    }
};

Gameplay.prototype.start = function (initParams) {
    this.gameStarted = true;
    var self = this;

    this.gameLoopTimer = setInterval(function () {

            if (!self.gameStarted) {
                return;
            }

            //Update Gametime
            self.gameStatus.time.elapsedTime = Constants.gameTime.timeBetweenUpdates;
            self.gameStatus.time.total += Constants.gameTime.timeBetweenUpdates;

            self.gameStatus.time.simulationElapsedTime = Constants.gameTime.timeBetweenUpdates * self.gameStatus.time.simulationTimeRatio;
            self.gameStatus.time.simulationTotal += self.gameStatus.time.simulationElapsedTime;

            self.update(self.gameStatus.time);
            self.socket.emit('server-gameUpdate', self.gameStatus);

            //Clear game status dynamic log (Necessary?)
            self.gameStatus.log = [];
        }
        , Constants.gameTime.timeBetweenUpdates);

    //Saves the simulation
    DRM.get(this.id).saveSimulation({
        clientIP: this.socket.handshake.address,
        name: initParams.name
    },
    function (err, result) {

        if (err) {
            self.log(err, LogLevels.ERROR);
            return;
        }

        //Save the initial snapshot of the simulation
        DRM.get(self.id).takeSimulationSnapshot(null, null);

        //If the simulation mode is 'setInteractionsGuide', we must associate this simulation to the current scenary
        // scheduler involved in the mission
        if (ConfigurationParameters.useDB && self.mode == 'setInteractionsGuide') {
            ScenarySchedulerModel.insertOrUpdate(
                initParams.scenarySchedulerId,
                initParams.missionPlanId,
                initParams.incidentsPlanId,
                result._id,
                function (err, result) {
                    self.log('Current Scenary scheduler linked to current simulation', LogLevels.DEBUG);
                    self.log('Simulation started', LogLevels.INFO);
                }
            );
        }

    });
};

Gameplay.prototype.finish = function () {
    //Finish gameLoop
    clearInterval(this.gameLoopTimer);

    //Take the last snapshot of the simulation and save the simulation
    //DRM.get(this.id).takeSimulationSnapshot(null,null);
}

// Export the Gameplay class so you can use it in
// other files by using require("Gameplay").Gameplay
module.exports = Gameplay;