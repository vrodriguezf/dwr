define(['Phaser',
		'app/game',
		'app/constants',
		'app/props',
		'app/styles',
		'app/utils/converters'], function (Phaser, game, Constants,Props,Styles,Converters) {

	function FuelStation (data) {

		//Super constructor
		Phaser.Sprite.call(this,
							game,
							Converters.cartesianXToGameX(data.position.x),
							Converters.cartesianYToGameY(data.position.y),
							Constants.fuelStation.asset.key,
							0);
		this.anchor.setTo(0.5,0.5);
		this.alpha = 1;
		this.scale.x = Constants.fuelStation.sprite.scale.x;
		this.scale.y = Constants.fuelStation.sprite.scale.y;

		//Sprite input
		this.inputEnabled = true;
		this.input.consumePointerEvent = true;
		this.events.onInputOver.add(onInputOverCallback,this);
		this.events.onInputOut.add(onInputOutCallback,this);

		this.data = data;
		this.id = data.id;

		//Text information
		this.fuelInfoLabel = game.add.text(this.x,
											this.y + (1-this.anchor.y)*this.height + 3,
											''+Math.round(data.remainingFuel)+'/'+data.capacity);
		this.fuelInfoLabel.setStyle(Styles.fuelStation);
		this.fuelInfoLabel.anchor.setTo(0.5,0.5);

		game.add.existing(this);

		this.z = Props.zOrder.indexOf('fuelStations');

	}

	//Inheritance
	FuelStation.prototype = Object.create(Phaser.Sprite.prototype);
	FuelStation.prototype.constructor = FuelStation;

	FuelStation.prototype.getRealPosition = function ()	 {

		return [
			this.data.position.x,
			this.data.position.y
		]
	}

	FuelStation.prototype.updateFromServer = function(data) {

		if (data.remainingFuel <=0) {
			this.alpha = 0.5;
		}

		//If the station info has changed, change the label
		if (this.data.remainingFuel != data.remainingFuel) {
			console.log(data.remainingFuel);
			this.fuelInfoLabel.setText(''+Math.round(data.remainingFuel)+'/'+data.capacity);			
		}

		this.data = data;
	}

	/************************************
	** CALLBACKS
	************************************/
	function onInputOverCallback (sprite,pointer) {
		sprite.tint = 0x00ff00;		
	}

	function onInputOutCallback (sprite,pointer) {
		sprite.tint = 0xffffff;
	} 	

	return FuelStation;
})
