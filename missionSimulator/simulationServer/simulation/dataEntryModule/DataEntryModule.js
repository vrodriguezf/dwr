/**************************************************
* DATA ENTRY MODULE (DEM)
* TODO: Think this as a singleton?!?!?!
**************************************************/
var PointAirport = projRequire('/world/PointAirport');
var Area = projRequire('/areas/Area');
var Camera = projRequire('/payload/Camera');
var Constants = projRequire('/Constants');
var DangerAreaIncident = projRequire('/incidents/DangerAreaIncident');
var DEMStatuses = require('./DEMStatuses');
var Drone = projRequire('/drones/Drone');
var EnemyShip = projRequire('/ships/EnemyShip');
var FlightArea = projRequire('/areas/FlightArea');
var FuelStation = projRequire('/world/FuelStation');
var fs = require('fs');
var GameplayLogger = projRequire('/logger/GameplayLogger');
var Helpers = projRequire('/utils/helpers');
var LogLevels = projRequire('/logger/LogLevels');
var Radar = projRequire('/payload/Radar');
var Rectangle = projRequire('/utils/Rectangle');
var Refueling = projRequire('/tasks/Refueling');
var Surveillance = projRequire('/tasks/Surveillance');

/*
* CONSTRUCTOR
*/
function DataEntryModule (gameplayId) {
	this.gameplayId = gameplayId;
}

/**
* Load an environment file
*
**/
DataEntryModule.prototype.loadEnvironment = function (environmentFilePath, gameStatus) {

	if (!environmentFilePath || !gameStatus) {
		return {
			status : DEMStatuses.PARAMS_ERROR
		}
	}

	var environment = null;

	try {
		environment = JSON.parse(fs.readFileSync(environmentFilePath,'utf-8'));
	}
	catch (err) {
		return {
			status: DEMStatuses.custom(err.toString())
		}
	}

	//World
	gameStatus.world = new Rectangle(	environment.bounds.upperLeftCorner.x,
											environment.bounds.upperLeftCorner.y,
											Math.abs(environment.bounds.downRightCorner.x - environment.bounds.upperLeftCorner.x),
											Math.abs(environment.bounds.downRightCorner.y - environment.bounds.upperLeftCorner.y));

	gameStatus.sea = gameStatus.world;

	GameplayLogger.get(this.gameplayId).log('World bounds : (x = ' + gameStatus.world.x + 
							', y = ' + gameStatus.world.y + 
							'width = ' + gameStatus.world.width + 
							' km, height = ' + gameStatus.world.height +' km)', LogLevels.DEBUG);

	GameplayLogger.get(this.gameplayId).log('Sea bounds : (x = ' + gameStatus.sea.x + 
							', y = ' + gameStatus.sea.y + 
							'width = ' + gameStatus.sea.width + 
							' km, height = ' + gameStatus.sea.height + ' km)');

	// Flight Areas
	gameStatus.flightAreas = [];
	for (var i=0; i<environment.areas.length; i++) {
		var newFlightArea = new FlightArea(	environment.areas[i].areas_id,
												environment.areas[i].vertices,
												environment.areas[i].entry_point,
												environment.areas[i].exit_point);
		gameStatus.flightAreas.push(newFlightArea);
	}
	
	// No Flight Areas
	gameStatus.noFlightAreas = [];
	for (var i=0; i<environment.noflight_zones.length; i++) {
		var newNoFlightArea = new Area(	environment.noflight_zones[i].noflight_zones_id,
										environment.noflight_zones[i].vertices);
		gameStatus.noFlightAreas.push(newNoFlightArea);
	}	

	//Airports
	gameStatus.airports = [];
	for (var i=0; i<environment.airports.length; i++) {
		gameStatus.airports.push(new PointAirport(	environment.airports[i].airports_id,
													environment.airports[i].position));
	}

	//Refueling stations
	gameStatus.fuelStations = [];
	var newFuelStation = null;
	for (var i=0; i<environment.refueling_stations.length; i++) {
		newFuelStation = new FuelStation(	environment.refueling_stations[i].refueling_stations_id,
											environment.refueling_stations[i].position,
											{
												capacity : environment.refueling_stations[i].fuel_capacity,
												refuelingSpeed : environment.refueling_stations[i].refueling_speed
											})
		gameStatus.fuelStations.push(newFuelStation);
		GameplayLogger.get(this.gameplayId).log('Created refuel station: [ID = ' + newFuelStation.id + 
										', position = (' + newFuelStation.position.x + ',' + newFuelStation.position.y + ')]');
	}

	//Drones
	gameStatus.drones = [];
	var newDrone=null;	
	for (var i=0; i<environment.uavs.length; i++) {

		newDrone = new Drone(environment.uavs[i].uavs_id,
			this.gameplayId,
		 	{
		 	name: environment.uavs[i].name,
		 	type: environment.uavs[i].type,			
			maxAltitude : environment.uavs[i].max_altitude,
			minAltitude : environment.uavs[i].min_altitude,
			maxSpeed : environment.uavs[i].max_speed,
			minSpeed : environment.uavs[i].min_speed,
			maxFlightTime : environment.uavs[i].max_flight_time,
			communicationRange : environment.uavs[i].communication_range,
			fuelCapacity : environment.uavs[i].max_fuel,
			fuelConsumption: environment.uavs[i].fuel_consume,
			fuel : environment.uavs[i].fuel
		});

		//Set the drone position (Airport)
		newDrone.setAirport(Helpers.getById(gameStatus.airports,environment.uavs[i].airports_id));
		//newDrone.position = {x: 127, y: -4};

		//Drone payload
		var payload = environment.uavs[i].payload;
		var newPayloadElement = null;
		for (var j=0; j<payload.length; j++) {
			if (payload[j].payload_type == Constants.payload.camera.typeName) {
				newPayloadElement = new Camera(payload[j].payload_id, payload[j]);
			}
			else if (payload[j].payload_type == Constants.payload.radar.typeName) {
				newPayloadElement = new Radar(payload[j].payload_id,newDrone.position,payload[j]);
			}
			else {
				GameplayLogger.get(this.gameplayId).log('Payload element not recognized. Please check the environment file');
			}

			//Add the payload element to the drone payload
			if (newPayloadElement!=null) {
				newDrone.addPayloadElement(newPayloadElement);
			}
		}

		gameStatus.drones.push(newDrone);
		GameplayLogger.get(this.gameplayId).log('Created new drone: [ID = ' + newDrone.id + 
									', position = (' + newDrone.position.x + ',' + newDrone.position.y +')]');
	}	

	return {
		status: DEMStatuses.OK,
		fileID : environment.id
	};	
};

/**
* Load targets file
*
**/
DataEntryModule.prototype.loadTargets = function (targetsFilePath,gameStatus, options) {

	//Error control
	if (!targetsFilePath || !gameStatus) {
		return {
			status : DEMStatuses.PARAMS_ERROR
		}
	}

	var targetsInput = null;

	try {
		targetsInput = JSON.parse(fs.readFileSync(targetsFilePath,'utf-8'));		
	}
	catch (err) {
		return {
			status: DEMStatuses.custom(err.toString())
		}		
	}

	gameStatus.ships = [];
	var newShip = null;		
	for (var i=0; i<targetsInput.targets.length; i++) {
		newShip = null;
		//Check if we have loaded the selected area in this environment
		var targetArea = Helpers.getById(gameStatus.flightAreas,targetsInput.targets[i].areas_id);

		if (targetArea == null) {
			GameplayLogger.get(this.gameplayId).log('Target area not recognized. Check the targets file', 'ERROR');
		}
		else {
			if (targetsInput.targets[i].type == 'enemy') {
				newShip = new EnemyShip(targetsInput.targets[i].targets_id,this.gameplayId,targetArea,targetsInput.targets[i]);
			}
			else {
				GameplayLogger.get(this.gameplayId).log('Target type not recognized. check the targets file', 'ERROR');
			}
		}

		if (newShip!= null) {
			GameplayLogger.get(this.gameplayId).log('Target created [Type = ' + newShip.type +
												', Position = (' + newShip.position.x + ',' + newShip.position.y + ')'
												+ ']');
			gameStatus.ships.push(newShip);
			gameStatus.statistics.targetsTotalCount++;
		}
	}	

	return {
		status : DEMStatuses.OK,
		fileID : targetsInput.id
	}

}

DataEntryModule.prototype.loadPlan = function (planFilePath, gameStatus, options) {

	//Error control
	if (!planFilePath || !gameStatus) {
		return {
			status : DEMStatuses.PARAMS_ERROR
		}
	}

	var plans = null;

	try {
		plans = JSON.parse(fs.readFileSync(planFilePath,'utf-8'));		
	}
	catch (err) {
		return {
			status: DEMStatuses.custom(err.toString())
		}		
	}	


	var flightPlanner = plans.flight_plan;
	var payloadPlanner = plans.payload_plan;

	//Payload plan loader
	var payloadTasks = []; //TODO: Put this into GameStatus? GameInitStatus?
	for (var i=0; i< payloadPlanner.length; i++) {
		var newTask = null;

		//Search the drone which will perform the task
		var droneAssociated = Helpers.getById(gameStatus.drones, payloadPlanner[i].uavs_id);

		if (payloadPlanner[i].task_type == 'surveillance') {
			var areaAssociated = Helpers.getById(gameStatus.flightAreas,payloadPlanner[i].areas_id);
			newTask = new Surveillance(payloadPlanner[i].tasks_id,
										this.gameplayId,
										areaAssociated,
										payloadPlanner[i]);
		}
		else if (payloadPlanner[i].task_type == 'refueling') {

			//Look for the associated refueling station
			var refuelingStationAssociated = Helpers.getById(gameStatus.fuelStations,payloadPlanner[i].refueling_stations_id);

			newTask = new Refueling(payloadPlanner[i].tasks_id,
									this.gameplayId,
									refuelingStationAssociated,
									payloadPlanner[i].start_time,
									payloadPlanner[i].end_time);
		}
		else {
			GameplayLogger.get(this.gameplayId).log('Task type [' + payloadPlanner[i].task_type + '] not recognized. Please check the mission input', 'ERROR');
		}

		if (newTask != null) {
			payloadTasks.push(newTask);			
			GameplayLogger.get(this.gameplayId).log('Task [ID =  ' + newTask.id + ', Type = ' + newTask.type + '] was created successfully');
		} 
	}


	//Flight plan loader
	for (var i=0; i< flightPlanner.length; i++) {

		var drone = Helpers.getById(gameStatus.drones, flightPlanner[i].uavs_id);

		if (!drone) {
			GameplayLogger.get(this.gameplayId).log('Drone ' + flightPlanner[i].uavs_id + 'not recognized in the mission. Check the mission input','ERROR')
			break;
		}

		var waypoints = flightPlanner[i].waypoints;
		for (var j=0; j<waypoints.length; j++) {

			//Check if the waypoint has an associated task
			var waypointTask = null;
			if (waypoints[j].tasks_id != null) {
				waypointTask = Helpers.getById(payloadTasks,waypoints[j].tasks_id);
			}

			drone.addWaypoint(	waypoints[j].x,
								waypoints[j].y,
								j, {
					type: waypoints[j].type,
					altitude: waypoints[j].altitude,
					speed : waypoints[j].speed,
					time: waypoints[j].time,
					task: waypointTask
				});
		}
	}

	return {
		status: DEMStatuses.OK,
		fileID : plans.id
	};

}

module.exports = DataEntryModule;