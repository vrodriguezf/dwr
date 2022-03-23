define(['Phaser',
		'app/game',
		'app/constants',
		'app/props',
		'app/utils/converters'], 
		function (Phaser,game,Constants, Props, Converters) {
	'use strict';

	//Class shared variables&constants
	var spriteScale = { x: 0.5, y : 0.5};

	//Constructor
	function Ship(id) {
		this.id = id;
		this.inCoast = false;
		this.sprite = {};
	}

	Ship.prototype.init = function (initData) {

		this.sprite.anchor.setTo(0.5,0.5);
	    this.sprite.z = Props.zOrder.indexOf('ships');

		//The ship is not visible to the player until it's detected
		//this.sprite.visible = false;

	}

	Ship.prototype.updateFromServer = function(data) {
		if (!data) {
			return;
		}

		//Update the sprite position
		this.sprite.position = Converters.realPointToGamePoint(data.position);

		//Check if we have benn detected
		if (data.detected) {
			this.detect();
		}

		//Set visibility
		this.sprite.visible = data.visible || data.detected;

		this.data = data;
	}

	Ship.prototype.detect = function () {
		this.sprite.visible = true;
		this.detected = true;
		this.sprite.lifespan = 3000;
		this.sprite.tint = 0xff0000;		
	}

	return Ship;
});