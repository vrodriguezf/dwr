define(['Phaser',
		'app/game',
		'app/constants',
		'app/props',
		'app/sprites/waypoint',
		'ClientAPI',
		'app/utils/converters',
		'app/graphics/camera',
		'app/graphics/radar',		
		'app/sprites/drones/droneStatus',
		'app/styles'], 
		function (Phaser,game,Constants, Props, Waypoint,ClientAPI,Converters,Camera,Radar,DroneStatus,Styles) {
	'use strict';

	//Shared variables
	var idCounter = 0;
	var spriteRotationStart0 = Math.PI/2;	//
	var ALTITUDE_EPSILON = 0.05;
	var FUEL_EPSILON = 1;

	//CONSTRUCTOR
	function Drone(game,droneData) {

		this.game = game;
		this.data = droneData;		

		this.id = (droneData.id != null)
			? droneData.id
			: idCounter++;

		//Super constructor
		Phaser.Sprite.call(	this,
								game,
								Converters.cartesianXToGameX(droneData.position.x),
								Converters.cartesianYToGameY(droneData.position.y),
								Constants.drone.asset.key);

		this.anchor.setTo(0.5, 0.5);
		this.angle = ((-1*droneData.rotation) + Math.PI/2)*(180/Math.PI);
		this.scale.x = Constants.drone.sprite.scale.x;
		this.scale.y = Constants.drone.sprite.scale.y

		//Add the sprite to the game
		game.add.existing(this);
		this.z = Props.zOrder.indexOf('drones');

		//Payload
		this.payload = [];
		for (var i=0; i<droneData.payload.length; i++) {
			if (droneData.payload[i].payloadType == 'radar') {
				var radar = new Radar(this.game,this,droneData.payload[i].id);
					radar.redraw();

				//Add the payload element to the game stage
				this.game.add.existing(radar);
				this.payload.push(radar);					
			}
			else if (droneData.payload[i].payloadType == 'camera') {

				var camera = new Camera(this.game,this,droneData.payload[i].id);
					camera.redraw();

				//Add the camera to the game stage
				this.game.add.existing(camera);
				this.payload.push(camera);
			}
		}

		//Selection frame (initially invisible)
		this.selectionFrameSprite = game.add.sprite(this.x,this.y,'droneSelectionFrame');
			this.selectionFrameSprite.anchor.setTo(0.5,0.5);
			this.selectionFrameSprite.z = Props.zOrder.indexOf('HUD');
			this.selectionFrameSprite.exists = false;

	    //Sprite inputs
	    this.inputEnabled = true;
	    this.input.useHandCursor = true;
	    this.input.consumePointerEvent = true;

	    //Change the sprite frame depending on the drone type
		/*
	    if (droneData.type == 0) {
	    	this.animations.add('fly',[0,1,2],10,true,true);
	    } 
	    else if (droneData.type == 1) {
	    	this.animations.add('fly',[3,4,5],10,true,true);
	    }
	    else if (droneData.type == 2) {
	    	this.animations.add('fly',[6,7,8],10,true,true);
	    }
	    else {
	    	//Default
	    	this.animations.add('fly',[0,1,2],10,true,true);
	    }

	    //Animations
	    this.animations.play('fly');
	    */

	    //Create the Waypoints sprite pool
	    this.waypoints = game.add.group();
	    this.waypoints.z = Props.zOrder.indexOf('waypoints');
	    var newWaypoint;
	    for (var i=0; i < Constants.drone.waypoint.max; i++) {
	    	newWaypoint = this.createNewWaypoint();
	    	this.waypoints.add(newWaypoint,true);
	    }
	    this.linePath = [];

		this.selected = false;
	};

	//Inheritance
	Drone.prototype = Object.create(Phaser.Sprite.prototype);
	Drone.prototype.constructor = Drone;	
	
	//Server update
	Drone.prototype.updateFromServer = function (droneData) {

		if (!droneData) {
			return;
		}

		//Update the drone sprite
		this.x = Converters.cartesianXToGameX(droneData.position.x);
		this.y = Converters.cartesianYToGameY(droneData.position.y);
		this.angle = ((-1*droneData.rotation) + Math.PI/2)*(180/Math.PI);

		if (droneData.fuelAlert != this.data.fuelAlert) {
			this.setFuelAlert(droneData.fuelAlert);
		}

		//Update the drone payload
		for (var i=0; i<this.payload.length; i++) {

			this.payload[i].updateFromServer(droneData.payload[i]);

			//Redraw a camera only if the altitude of the drone has changed considerably (DRAW EFFICIENCY)
			/*
			if (this.payload[i] instanceof Camera && 
				Math.abs(droneData.altitude - this.data.altitude) >= ALTITUDE_EPSILON) {
				console.log('Redrawing payload - Altitude change');
				this.payload[i].redraw();
			}
			*/
		}

		//Update the drone waypoints
		this.linePath = [];
		this.waypoints.setAll('exists',false);
		var waypointSprite, previousWaypointSprite;
		//Only show the waypoints if the drone is selected
		if (this.selected) {
			for (var i=0; i<droneData.waypoints.length; i++) {

				waypointSprite = this.waypoints.getAt(i);
				if (waypointSprite == -1) {
					waypointSprite = this.waypoints.add(this.createNewWaypoint());
				}
				waypointSprite.updateFromServer(droneData.waypoints[i],i);
	    		//waypointSprite.z = Constants.drone.waypoint.zIndex;

	    		if (i==0) {
					waypointSprite.scale.x = Constants.drone.waypoint.scale.x + Constants.drone.waypoint.nextWatpointScaleDelta;
					waypointSprite.scale.y = Constants.drone.waypoint.scale.y + Constants.drone.waypoint.nextWatpointScaleDelta;	    			

					//Linepath (drone-waypoint)
					this.linePath.push(new Phaser.Line(this.x,this.y,waypointSprite.x,waypointSprite.y));
	    		}
	    		else {
					waypointSprite.scale.x = Constants.drone.waypoint.scale.x;
					waypointSprite.scale.y = Constants.drone.waypoint.scale.y;

					//Linepath (waypoint-waypoint) (non action waypoints)
					if (previousWaypointSprite.data.type != 'action') {
						this.linePath.push(new Phaser.Line(previousWaypointSprite.x,previousWaypointSprite.y,
																waypointSprite.x,waypointSprite.y));
					}
	    		}

				waypointSprite.exists = true;
				previousWaypointSprite = waypointSprite; //Linepath loop
			}
		}		

		//Drone selection
		this.selectionFrameSprite.x = this.x;
		this.selectionFrameSprite.y = this.y;
		this.selectionFrameSprite.angle = this.angle;

		//Fuel info label update
		/*
		console.log(droneData.remainingFuel - this.data.remainingFuel);
		if (Math.abs(droneData.remainingFuel - this.data.remainingFuel) > FUEL_EPSILON) {
			this.fuelInfoLabel.setText(Math.round(droneData.remainingFuel)+'/'+droneData.fuelCapacity);
		}
		*/

		//Check if this drone is dead
		if (droneData.status.key == DroneStatus.DEAD || droneData.remainingFuel <=0) {
			console.log(droneData.remainingFuel);
			this.die();
		}

		//Save the data from the server
		this.data = droneData;
	}

	Drone.prototype.select = function () {
		game.camera.focusOn(this);		
		this.selected = true;
		this.selectionFrameSprite.exists = true;
	}

	Drone.prototype.unselect = function () {
		this.selected = false;
		this.selectionFrameSprite.exists = false;
	}

	Drone.prototype.die = function() {
		console.log('Drone ' + this.id + ' dying!');
		//Kill the sprite and add the explosion
		var droneExplosion = game.add.sprite(	this.x,
												this.y,
												Constants.explosion.asset.key);
		droneExplosion.z = this.z + 1;
		droneExplosion.anchor.setTo(0.5,0.5);
		droneExplosion.animations.add('explode');
		droneExplosion.play('explode',40,false,true);

		//Kill all the drone related sprites (TODO - Non graphic payload?)
		for (var i = 0; i<this.payload.length; i++) {
			this.payload[i].destroy();
		}

		this.selectionFrameSprite.destroy();
		this.waypoints.destroy();
		this.destroy();

	}

	//Change the drone sprite depending on the fuel status
	Drone.prototype.setFuelAlert = function (fuelAlert) {
		if (fuelAlert) {
			this.tint = 0xFF0000;
		}
		else {
			this.tint = 0xFFFFFF;
		}
	}

	Drone.prototype.createNewWaypoint = function() {
	    var newWaypoint = new Waypoint(game,0,0,Constants.waypoint.assetKey);
	    newWaypoint.events.onDragStop.add(onWaypointStopDragging,this);

	    return newWaypoint;		
	}

	/************************************
	** CALLBACKS
	************************************/
	function onWaypointStopDragging(waypoint,pointer) {
		waypoint.isDragging = false;

		//Send to the server the new path (Existing waypoints)
		var realPoint = Converters.gamePointToRealPoint({x:waypoint.x, y: waypoint.y});

		//Modify the waypoint-data object and send this data object to the server
		waypoint.data.x = realPoint.x;
		waypoint.data.y = realPoint.y; 

		ClientAPI.setWaypoint(this.id,waypoint.data.id,waypoint.data);
	}

	return Drone;
});