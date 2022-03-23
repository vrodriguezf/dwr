define(['Phaser',
		/*'io',*/'app/game',
		'app/constants',
		'app/props',
		'app/messages',
		'app/utils/helpers',
		'app/sprites/drone',
		'app/sprites/ships/humanShip',
		'app/sprites/ships/enemyShip',
		'app/sprites/fuelStation',
		'app/sprites/world/GCS',
		'app/utils/converters',
		'app/sprites/areas/flightArea',
		'app/sprites/areas/noFlightArea',
		'app/sprites/areas/corridor',
		'app/incidents/dangerAreaIncident',
		'app/sprites/airport',
		'app/incidents/incident',
		'ClientAPI',
		'lodash'],
		function (Phaser,game,Constants,Props,Messages,Helpers,Drone,HumanShip,EnemyShip,FuelStation,GCS,Converters,FlightArea,NoFlightArea,Corridor,DangerAreaIncident,Airport,Incident,ClientAPI,_) {

	/**
	* CONSTRUCTOR
	**/
	function WatchAndRescue() {

		//Super constructor
		Phaser.State.call(this);

		this.gameStarted = false;
		this.serverState; //Game status passed by the server
		this.lastServerState = null;
		this.cursors;

		this.environment = {
			flightAreas : [],
			noFlightAreas : [],
			corridors: []
		}

		this.background = {};
		this.sea;

		this.controlMode = {};
		this.waypointAddingCounter = 0; //For adding paths

		this.drones = [];
		this.incidents = [];
		this.ships = [];
		this.fuelStations = {};
		this.airports = [];

		this.selectedDrone = null;
	}

	//Inheritance (State -> WatchAndRescue)
	WatchAndRescue.prototype = Object.create(Phaser.State.prototype);
	WatchAndRescue.prototype.constructor = WatchAndRescue;

	//Server-socket communication handlers
	WatchAndRescue.prototype.createSocketEvents = function () {

		var self = this; //To use in callbacks

	    // Socket connection successful
	    socket.on("connect", function () {
			console.log('Connected to the socket server');	    	
	    });

	    // Socket disconnection
	    socket.on("disconnect", function () {
	    	console.log('Disconnected from socket server');
	    });

	    // Callback to the server  initial game state
	    socket.on('server-gameInit',function (initState) {
	    	console.log('Received initial game state');

			//Initial game set up
			self.initFromServer(initState);
	    });

	    //Callback to the server updates
	    socket.on('server-gameUpdate',function (state) {
	    	self.serverState = state;
	    });
	};

	//Init the game with the init server state
	WatchAndRescue.prototype.initFromServer = function (initState) {

		//First, calculate the optimal scale for this map
		//TODO: NOt touch the constans scale, put the scale anywhere else!!
		var optimalScale = Helpers.calculateOptimalScale(initState.world,this.game.stage.bounds);
		//var optimalScale = 1.6;
		console.log('Optimal scale calculated: ' + optimalScale + ' px/km');
		Constants.scale.pixelsPerKm = optimalScale;

		//Set the world limits
		game.world.setBounds(	initState.world.x*Constants.scale.pixelsPerKm,
								-1*initState.world.y*Constants.scale.pixelsPerKm,
								initState.world.width*Constants.scale.pixelsPerKm,
								initState.world.height*Constants.scale.pixelsPerKm);

		// Our tiled scrolling background (The this.sea)
		this.sea = game.add.tileSprite(	initState.sea.x*Constants.scale.pixelsPerKm,
									-1*initState.sea.y*Constants.scale.pixelsPerKm,
									initState.sea.width*Constants.scale.pixelsPerKm,
									initState.sea.height*Constants.scale.pixelsPerKm,
									'sea');

		this.sea.alpha = 1;
		this.sea.z = Props.zOrder.indexOf('background');
		this.sea.inputEnabled = true;
		this.sea.events.onInputDown.add(onSeaClicked,this);

		//Flight Areas
		for (var i=0; i<initState.flightAreas.length; i++) {
			var newFlightArea = new FlightArea(this.game,
												this.graphics,
												initState.flightAreas[i].vertices,
												initState.flightAreas[i].entryPoint,
												initState.flightAreas[i].exitPoint);
				newFlightArea.draw();
			this.environment.flightAreas.push(newFlightArea);
		}

		//No flight areas
		for (var i=0; i<initState.noFlightAreas.length; i++) {
			var newNoFlightArea = new NoFlightArea(this.game,this.graphics,initState.noFlightAreas[i].vertices);
				newNoFlightArea.draw();
			this.environment.noFlightAreas.push(newNoFlightArea);
		}

		//Corridors
		for (var i=0; i<initState.corridors.length; i++) {
			var newCorridor = new Corridor(this.game,this.graphics,initState.corridors[i].vertices);
			newCorridor.draw();
			this.environment.corridors.push(newCorridor);
		}

		//GCSs
		_.forEach(initState.gcss,function (gcs) {
			new GCS(gcs);
		});

		//Control mode
		this.controlMode = initState.controlMode;	

		//Create drone sprites
		for (var i=0; i<initState.drones.length; i++) {
			var newDrone = new Drone(this.game,initState.drones[i]);
				newDrone.events.onInputDown.add(onDroneClicked,this);
			this.drones.push(newDrone);
		}

		//Create ship sprites
		var clientShip;
		for (var i=0; i<initState.ships.length; i++) {
			clientShip = this.createClientShip(initState.ships[i]);
			if (clientShip !=null) {
				this.ships.push(clientShip);				
			}
		}

		//Create fuel station sprites
		this.fuelStations = [];
		for (var i=0; i<initState.fuelStations.length; i++) {
			var fuelStation = new FuelStation(initState.fuelStations[i]);
				fuelStation.events.onInputDown.add(onFuelStationClicked,this);
			this.fuelStations.push(fuelStation);
		}

		//Create airport sprites
		this.airports = [];
		for (var i=0; i<initState.airports.length; i++) {
			var airport = new Airport(this.game,initState.airports[i]);
				airport.events.onInputDown.add(onAirportClicked,this);
			this.airports.push(airport);
		}

		//Selected drone by default (none)
		this.selectedDrone = initState.selectedDrone;

		//Camera
		game.camera.setPosition(-1*Constants.STAGE_WIDTH/2,
								game.world.height - Constants.STAGE_HEIGHT);		

		/*Start the game only when we have received
		the server start signal */
		this.gameStarted = true;
		
	};

	//Update the client game based on the server state
	WatchAndRescue.prototype.updateFromServerState =  function (state) {
		//If the server state is not defined, we don nothing
		if (!state) {
			return;
		}

		//Update this.drones
		for (var i=0; i<state.drones.length; i++) {
			var serverDrone = state.drones[i];
			var clientDrone = Helpers.getById(this.drones,serverDrone.id);
			if (clientDrone) {
				clientDrone.updateFromServer(serverDrone);				
			}
		}

		//Update control mode
		if (state.controlMode.id != this.controlMode.id) {
			this.changeControlMode(state.controlMode);
		}

		//Update selected drone TODO: Only update this when necessary
		this.setSelectedDrone(state.selectedDrone);					

		//Update ships
		for (var i=0; i<state.ships.length; i++) {
			//Look for the ship in the client cache
			var serverShip = state.ships[i];
			var clientShip = Helpers.getById(this.ships,serverShip.id);
			if (!clientShip) {
				//Create a new Ship (Client)
				clientShip = this.createClientShip(serverShip);
				if (clientShip!=null) this.ships.push(clientShip);
			} else {
				clientShip.updateFromServer(serverShip);				
			}
		}

		//Update incidents (Update + create (Remove is done in the client pre-update))
		for (var i=0; i<state.incidents.length; i++) {
			var clientIncident = Helpers.getById(this.incidents,state.incidents[i].id);
			if (!clientIncident) {
				clientIncident = this.createClientIncident(state.incidents[i]);
				if (clientIncident!=null) {
					//Create + notify
					this.incidents.push(clientIncident);
					clientIncident.notify(this.incidents.indexOf(clientIncident));
				}
			} else {
				clientIncident.updateFromServer(state.incidents[i]);
			}
		}

		//Update fuel stations (Unvariable from beggining)
		for (var i=0; i<state.fuelStations.length; i++) {
			var serverFuelStation = state.fuelStations[i];
			var clientFuelStation = Helpers.getById(this.fuelStations,serverFuelStation.id);
			if (clientFuelStation) {
				clientFuelStation.updateFromServer(serverFuelStation);
			}
		}

		this.lastServerState = state;
	}

	WatchAndRescue.prototype.changeControlMode = function (controlMode) {
		this.controlMode = controlMode;

		//Restart the waypoint adding counter
		this.waypointAddingCounter = 0;
	}

	//Create a new client ship properly, given the server data
	WatchAndRescue.prototype.createClientShip = function (serverShip) {

		var newShip = null;

		if (!serverShip) return null;

		//The serverShip's type marks the subclass of Ship that we must create
		if (serverShip.type == Constants.ship.humanShip.type) {
			console.log('creating human ship');
			newShip = new HumanShip(serverShip.id);
		}
		else if (serverShip.type == Constants.ship.enemyShip.type){
			newShip = new EnemyShip(serverShip.id);
		}
		else {
			console.log('Trying to create ship...not recognized type');
		}

		if (newShip) {
			newShip.create(serverShip);				
		}

		return newShip;		
	}

	WatchAndRescue.prototype.createClientIncident = function (serverIncident) {
		var newIncident = null;

		if (!serverIncident) return null;

		//The serverIncident type marks the client incident subclass
		switch (serverIncident.type) {
			case "DangerAreaIncident" :
				newIncident = new DangerAreaIncident(serverIncident.id,this.game,serverIncident);
			break;
			case "PayloadIncident" :
			case "FuelIncident": 
				newIncident = new Incident(serverIncident.id,this.game,serverIncident);
			break;
			default:
				console.log('ERROR: Incident type not recgonized.');
			break;
		}

		return newIncident;
	}

	WatchAndRescue.prototype.handleCamera = function () {
	    if (this.cursors.up.isDown)
	    {
	        game.camera.y -= Constants.camera.speedY;
	    }
	    else if (this.cursors.down.isDown)
	    {
	        game.camera.y += Constants.camera.speedY;
	    }

	    if (this.cursors.left.isDown)
	    {
	        game.camera.x -= Constants.camera.speedX;
	    }
	    else if (this.cursors.right.isDown)
	    {
	        game.camera.x += Constants.camera.speedX;
	    }
	};

	//Input sender
	WatchAndRescue.prototype.sendInput = function (input) {
		socket.emit('client-input',[input]);
	}

	WatchAndRescue.prototype.addWaypoint = function (drone,waypoint) {
		if (game.input.mouse.button == Phaser.Mouse.LEFT_BUTTON) {

			if (this.controlMode.id == Constants.controlModes.ADDING_WAYPOINTS) {
				ClientAPI.addWaypoint(drone.id,waypoint,this.waypointAddingCounter++);				
			}
			else if (this.controlMode.id == Constants.controlModes.MANUAL) {
				if (this.waypointAddingCounter == 0) {
					this.waypointAddingCounter++;
					ClientAPI.setPath(drone.id,[waypoint]);
				}
				else {
					ClientAPI.addWaypoint(drone.id,waypoint,this.waypointAddingCounter++);				
				}
			}
		}
	};

	WatchAndRescue.prototype.setSelectedDrone = function (serverDrone) {

		if (serverDrone == null) {
			if (this.selectedDrone) this.selectedDrone.unselect();
			this.selectedDrone = null;
			return;
		}
		else {
			var clientDrone = Helpers.getById(this.drones,serverDrone.id);

			if (clientDrone!=null && clientDrone!=this.selectedDrone) {
				this.selectedDrone = clientDrone;
				clientDrone.select();

				//Unselect other drones TODO -- Check uif this is necessary
				for (var i=0; i<this.drones.length; i++) {
					if (this.drones[i].id != clientDrone.id) {
						this.drones[i].unselect();
					}
				}
			}			
		}		
	};

	//Sea-click callbacks
	function onSeaClicked(sea,pointer) {
		if (this.selectedDrone!=null) {
			this.addWaypoint(this.selectedDrone,Helpers.createWaypointToSend(pointer.worldX,pointer.worldY));
		}
	}

	//Handle drone selection
	function onDroneClicked(drone,pointer) {
		//Send the input to the game server
		this.sendInput({
			name: Constants.input.selectDrone.name,
			params : {
				droneId : drone.id
			}
		});
	}

	//Event callback listening to click events in fuel stations sprites
	function onFuelStationClicked(fuelStation, pointer) {
		if (this.selectedDrone != null) {
			//Move the drone to a refueling waypoint
			var realFuelstationPosition = fuelStation.getRealPosition();
			this.addWaypoint(this.selectedDrone, Helpers.createWaypointToSend(realFuelstationPosition[0],
																			realFuelstationPosition[1],
																			'refueling',
																			false));
		}
	}

	//Event callback listening to click events in fuel stations sprites
	function onAirportClicked(airport, pointer) {
		if (this.selectedDrone != null) {
			//Create a landing waypoint
			var realAirportStation = airport.getRealPosition();
			this.addWaypoint(this.selectedDrone, Helpers.createWaypointToSend(realAirportStation[0],
																			realAirportStation[1],
																			'land',
																			false));
		}
	}

	WatchAndRescue.prototype.preload = function() {

		if (Constants.debug) {
      		game.time.advancedTiming = true;					
		}

		//Load game assets
		game.load.image('sea',window.baseUrl + 'assets/sea.png');
		game.load.image('sensor',window.baseUrl + 'assets/orange-light.png');
		game.load.image('droneSelectionFrame',window.baseUrl +'assets/selection.png');
		game.load.image(Constants.airport.asset.key,window.baseUrl +Constants.airport.asset.path);
		game.load.image(Constants.gcs.asset.key,window.baseUrl + Constants.gcs.asset.path);

		game.load.image(Constants.drone.asset.key,
						window.baseUrl + Constants.drone.asset.path);
		game.load.spritesheet(Constants.ship.humanShip.assetKey,window.baseUrl +'assets/boat.png',53,90);
		game.load.spritesheet(Constants.ship.enemyShip.assetKey,window.baseUrl +'assets/pirateShip.png',80,96);
		game.load.spritesheet(Constants.waypoint.assetKey,window.baseUrl +'assets/flag.png',108,100);
		game.load.spritesheet(	Constants.explosion.asset.key,
								window.baseUrl +Constants.explosion.asset.path,
								Constants.explosion.sprite.frames.width,
								Constants.explosion.sprite.frames.height);
		game.load.spritesheet(	Constants.fuelStation.asset.key,
								window.baseUrl +Constants.fuelStation.asset.path,
								Constants.fuelStation.sprite.frames.width,
								Constants.fuelStation.sprite.frames.height);											
	};

	WatchAndRescue.prototype.create = function() {

			//Remove right-button contextural menu behavouir
			game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

			//Create the cursos listeners
			this.cursors = game.input.keyboard.createCursorKeys();

			//Create the graphics object
			this.graphics = this.game.add.graphics(0,0);			

			//Set the socket handlers
			this.createSocketEvents();

			//When everything is created, we ask  the serverfor a new gameplay
			socket.emit('client-newGameplay', {
				missionPlanId: window.queryParams['missionPlanId'],
				scenarySchedulerId : window.queryParams['scenarySchedulerId'],
				test: window.queryParams['test'],
				mode: window.queryParams['mode'],
				incidentsPlanId: window.queryParams['incidentsPlanId'],
				name: window.queryParams['name']
            });
	};

	WatchAndRescue.prototype.update	= function() {
			if (!this.gameStarted) {
				return;
			}

			//Pre-update (Clean dead sprites and reset values)
			this.drones = this.drones.filter(function (drone) {
				return drone.exists;
			});

			if (this.selectedDrone!= null && !this.selectedDrone.exists) {
				this.selectedDrone = null;
			}

			this.ships = this.ships.filter(function (ship) {
				return !ship.inCoast && !ship.detected;
			});

			this.incidents = this.incidents.filter(function (incident) {
				return !incident.finished
			});			

			//Update from server
			this.updateFromServerState(this.serverState);
			this.serverState = null;

			//Camera movement
			this.handleCamera();

			//Sort sprites
			game.world.sort();
	};

 	WatchAndRescue.prototype.render = function() {
		//Render selected drone line path (TODO: Do this with graphics?)!
		if (this.selectedDrone!= null) {
			for (var i=0; i<this.selectedDrone.linePath.length; i++) {
				this.game.debug.geom(this.selectedDrone.linePath[i],'rgba(255,255,255,0.5)')
			}
		}

		//Show control information
		game.debug.text('Control mode: ' + this.controlMode.key,5,20);
		game.debug.text('Targets detected: ' + (this.lastServerState 
			? (this.lastServerState.statistics.captured+'/'+this.lastServerState.statistics.targetsTotalCount) 
			: (0+'/'+0)
			),5,40);
		game.debug.text('Remaining Fuel: ' + ((this.selectedDrone) 
												? (Math.round(this.selectedDrone.data.remainingFuel)+'/'+this.selectedDrone.data.fuelCapacity) 
												: '--'), 5,60);

		//Show pointer information
		//game.debug.inputInfo(5,60);

		if (Constants.debug) {
			game.debug.text('Current FPS: ' + (game.time.fps), 4, 15, "#00ff00");			
			game.debug.text('Min FPS: ' + (game.time.fpsMin), 4, 30, "#00ff00");
			game.debug.text('Max FPS: ' + (game.time.fpsMax), 4, 45, "#00ff00");			
		}
	};

	return WatchAndRescue;
});