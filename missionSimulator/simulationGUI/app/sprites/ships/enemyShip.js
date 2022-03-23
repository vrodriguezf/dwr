define(['Phaser',
		'app/game',
		'app/constants',
		'./ship'],
		 function (Phaser, game, Constants, Ship) {

	//Class shared variables&constants
	var spriteScale = {x: 0.8, y: 0.8};
	var frameRate = 10;

	//Constructor
	function EnemyShip(id) {
		Ship.call(this,id);
		this.lastRotation = null;
	}

	//Inheritance
	EnemyShip.prototype = Object.create(Ship.prototype);
	EnemyShip.prototype.constructor = EnemyShip;

	//Create the element in the game
	EnemyShip.prototype.create = function (initData) {

		this.sprite = game.add.sprite(	initData.position.x,
										initData.position.y,
										Constants.ship.enemyShip.assetKey);

		this.sprite.scale.x = spriteScale.x;
		this.sprite.scale.y = spriteScale.y;

		this.sprite.animations.add('down',[0],frameRate,true,true);		
		this.sprite.animations.add('left',[4],frameRate,true,true);
		this.sprite.animations.add('right',[8],frameRate,true,true);
		this.sprite.animations.add('up',[12],frameRate,true,true);


		Ship.prototype.init.call(this,initData);
	}

	EnemyShip.prototype.playAnimation  = function (data) {

		var r = data.rotation;

		if (r==Math.PI/2) {
			this.sprite.animations.play('up');
		}
		else if (r == (-1)*Math.PI/2) {
			this.sprite.animations.play('down');
		}
		else if (r==0) {
			this.sprite.animations.play('right');
		}
		else if (r == Math.PI || r == (-1)*Math.PI) {
			this.sprite.animations.play('left');
		}
	}	

	//Replace the update method
	EnemyShip.prototype.updateFromServer = function (data) {

		Ship.prototype.updateFromServer.call(this,data);

		//Change the sprite animation depending on the rotation
		if (this.lastRotation==null || this.lastRotation != data.rotation) {
			this.playAnimation(data);
			this.lastRotation = data.rotation;					
		}
	}

	return EnemyShip;
});