define(['Phaser','Geo','LatLon','app/constants'], function (Phaser,Geo,LatLon,Constants) {

	//Constructor
	function UAV (game,geoWorld,initData) {

		//Error checking
		if (!initData) {
			console.log('UAV creation failed. Missing initialization data');
		}

		this.geoWorld = geoWorld;
		this.data = initData;

		var UAVpos = geoWorld.getXY(new LatLon(Geo.parseDMS(initData.position.lat),
											Geo.parseDMS(initData.position.long)));

		Phaser.Sprite.call( this,
							game,
							UAVpos.x,//game.world.randomX,
							UAVpos.y,//game.world.randomY,
							'drones',
							0);

		this.anchor.setTo(0.5, 0.5);
	    this.z = Constants.drone.zIndex;
	    this.bringToTop();

	    //Sprite inputs
	    this.inputEnabled = true;
	    this.input.useHandCursor = true;
	    this.input.consumePointerEvent = true;

	    //Change the sprite frame depending on the drone type
	    if (initData.type == 0) {
	    	this.animations.add('fly',[0,1,2],10,true,true);
	    } 
	    else if (initData.type == 1) {
	    	this.animations.add('fly',[3,4,5],10,true,true);
	    }
	    else if (initData.type == 2) {
	    	this.animations.add('fly',[6,7,8],10,true,true);
	    }
	    else {
	    	//Default
	    	this.animations.add('fly',[0,1,2],10,true,true);
	    }

	    //Animations
	    this.animations.play('fly');
	}


	//Inheritance
	UAV.prototype = Object.create(Phaser.Sprite.prototype);
	UAV.prototype.constructor = UAV;	

	return UAV;	
});