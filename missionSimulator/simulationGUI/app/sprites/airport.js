define(['Phaser',
		'app/constants',
		'app/props',
		'app/styles',
		'app/utils/converters',
		'app/sprites/areas/area'],
	function (Phaser, Constants,Props,Styles,Converters,Area) {

	//CONSTRUCTOR + Add
	function Airport(game,initData) {

		//Check if the initData (from server) is correct
		if (initData == null || initData.position==null) {
			console.log('ERROR - Bad airport construction. Continue execution');
			return;
		}

		var gamePosition = Converters.clientCoordConverter(initData.position);

		//Super-constructor
		Phaser.Sprite.call(	this,
								game,
								gamePosition.x,
								gamePosition.y,
								Constants.airport.asset.key,
								0);

		//Sprite properties
		this.data = initData;
		this.anchor.setTo(	Constants.airport.sprite.anchor.x,
							Constants.airport.sprite.anchor.y);
		this.scale.x = Constants.airport.sprite.scale.x;
		this.scale.y = Constants.airport.sprite.scale.y;

		//Input
		this.inputEnabled = true;
		this.input.consumePointerEvent = true;
		this.events.onInputOver.add(onInputOverCallback,this);
		this.events.onInputOut.add(onInputOutCallback,this);

		//Label
		this.label = new Phaser.Text(game,
									0,
									(this.height/this.scale.y)*(1-this.anchor.y),
									(initData.name!=null) ? initData.name : initData.id,
									Styles.airport.label);
		this.label.anchor.setTo(0.5,0);
		this.addChild(this.label);

		//Area - Airport (Draws an area with the airport)
		if (initData.type == 'AreaAirport') {
			//TODO: DO NOT Create a graphics object for each area airport!! (EFFICIENCY)
			this.area = new Area(game,game.add.graphics(0,0),initData.area.vertices);
			this.area.draw(0xFFFFFF	,1);
		}

		//Auto-add the sprite with the constructor
		game.add.existing(this);
		this.z = Props.zOrder.indexOf('airports');
	}

	//Inheritance
	Airport.prototype = Object.create(Phaser.Sprite.prototype);
	Airport.prototype.constructor = Airport;

	Airport.prototype.getRealPosition = function () {
		return [
			this.data.position.x,
			this.data.position.y
		];
	};

	Airport.prototype.redraw = function () {
		
	};

	/************************************
	** CALLBACKS
	************************************/
	function onInputOverCallback (sprite,pointer) {
		sprite.tint = 0x00ff00;		
	}

	function onInputOutCallback (sprite,pointer) {
		sprite.tint = 0xffffff;
	}	

	return Airport;
})
