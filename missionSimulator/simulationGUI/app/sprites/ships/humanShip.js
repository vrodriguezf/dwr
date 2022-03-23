define(['Phaser',
		'app/game',
		'app/constants',
		'./ship'], function (Phaser, game, Constants, Ship) {

	//Class shared variables&constants
	var spriteScale = {x: 0.5, y: 0.5};

	//Constructor
	function HumanShip(id) {
		Ship.call(this,id);
	}

	//Inheritance
	HumanShip.prototype = Object.create(Ship.prototype);
	HumanShip.prototype.constructor = HumanShip;

	//Create the element in the game
	HumanShip.prototype.create = function (initData) {

		this.sprite = game.add.sprite(	initData.position.x,
										initData.position.y,
										Constants.ship.humanShip.assetKey);

		this.sprite.scale.x = spriteScale.x;
		this.sprite.scale.y = spriteScale.y;

		this.sprite.animations.add('move');
		this.sprite.animations.play('move');		

		Ship.prototype.init.call(this,initData);
	}	

	//Replace the update method
	HumanShip.prototype.updateFromServer = function (data) {
		Ship.prototype.updateFromServer.call(this,data);

		//Update sprite angle depending on the rotation
		this.sprite.angle = (data.rotation + Math.PI/2)*(180/Math.PI);
	}

	return HumanShip;
});