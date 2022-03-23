define(['Phaser','app/constants','app/sprites/buttons/labelButton'], function (Phaser, Constants, LabelButton) {
	/******************************************
	* MENU STATE
	*******************************************/

	function Menu() {

		//Super constructor
		Phaser.State.call(this);

		//Class members
		this.environment = null;
		this.buttons = {};
	}

	//Inheritance (State -> Menu)
	Menu.prototype = Object.create(Phaser.State.prototype);
	Menu.prototype.constructor = Menu;

	/*
	*	STATE MAIN METHODS
	*/

	Menu.prototype.preload = function () {
		this.game.stage.backgroundColor = '#BAB4CF';

		//Load assets
		this.game.load.image('buttonBackground','assets/img/buttonBackground.png');

		this.game.load.image('sea','assets/sea.png');
		this.game.load.image('coast','assets/coast.png');
		this.game.load.image('sensor','assets/orange-light.png');
		this.game.load.image('droneSelectionFrame','assets/selection.png');

		this.game.load.spritesheet('drones','assets/BigPlanes.png',65,65,-1,1,1);
		this.game.load.spritesheet(Constants.ship.humanShip.assetKey,'assets/boat.png',53,90);
		this.game.load.spritesheet(Constants.ship.enemyShip.assetKey,'assets/pirateShip.png',80,96);
		this.game.load.spritesheet(Constants.waypoint.assetKey,'assets/flag.png',108,100);
		this.game.load.spritesheet(	Constants.explosion.asset.key,
								Constants.explosion.asset.path,
								Constants.explosion.sprite.frames.width,
								Constants.explosion.sprite.frames.height);
		this.game.load.spritesheet(	Constants.fuelStation.asset.key,
								Constants.fuelStation.asset.path,
								Constants.fuelStation.sprite.frames.width,
								Constants.fuelStation.sprite.frames.height);			
	}

	Menu.prototype.create = function () {

		this.buttons = this.game.add.group();

		//Creates the buttons and add to the game
		var mapSelectionButton = new LabelButton(this.game,
														this.game.world.centerX,
														this.game.world.centerY,
														'buttonBackground',
														'Cargar entorno...',
														onMapSelectionClick,this,
														0,0,0,0);
		this.buttons.add(mapSelectionButton);

		var playButton = new LabelButton(this.game,
												this.game.world.centerX,
												mapSelectionButton.y + mapSelectionButton.height + 10,
												'buttonBackground',
												'PLAY',
												onPlayClick,
												this,
												0,0,0,0);

		this.buttons.add(playButton);

		var graphics = this.game.add.graphics(0,0);
	    // set a fill and line style
	    graphics.beginFill(0xFF3300);
	    graphics.lineStyle(10, 0xffd900, 1);		
		var polygon = new Phaser.Polygon([0,0,10,10,10,-10]);
		graphics.drawPolygon(polygon);
		console.log(polygon);
		console.log(graphics.drawPolygon);		


	}

	Menu.prototype.update = function () {

	}

	Menu.prototype.render = function () {

	}

	/**
	* CALLBACKS
	*/
	function onMapSelectionClick() {
		/*
		this.game.load.json('environment','../resources/preplanningEnvironment.json');
		this.game.load.onLoadStart.addOnce(onEnvironmentLoadStarted,this);		
		this.game.load.onLoadComplete.addOnce(onEnvironmentLoadCompleted,this);
		console.log(this.game.load.hasLoaded);
		*/
		this.game.state.start('DefineTasks',true,false,'assets/data/environment.json');
	}

	function onPlayClick() {
		this.game.state.start('Watch&Rescue');
	}

	function onEnvironmentLoadStarted() {
		console.log('Enviroment loading started !!!!');
	}

	function onEnvironmentLoadCompleted() {
		//Get the JSON loaded
		if (this.game.cache.checkJSONKey('environment')) {
			this.environment = this.game.cache.getJSON('environment');

			console.log(this.environment);
		}
	}

	/**
	* RETURN A REFERENCE TO THE CLASS CONSTRUCTOR
	*/
	return Menu;
});

