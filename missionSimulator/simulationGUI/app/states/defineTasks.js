define(['Phaser',
	'app/constants'],
	 function (Phaser,Constants) {

	function DefineTasks() {

		Phaser.State.call(this);
	}

	//Inheritance (State -> DefineTasks)
	DefineTasks.prototype = Object.create(Phaser.State.prototype);
	DefineTasks.prototype.constructor = DefineTasks;

	/*
	*	STATE MAIN METHODS
	*/
	DefineTasks.prototype.init = function (environmentURL) {
		console.log('Initializating DefineTasks state...');
		this.environmentURL = environmentURL;
	}

	DefineTasks.prototype.preload = function () {
		console.log(this.environmentURL);
		this.game.load.json('environment', this.environmentURL)
	}	

	DefineTasks.prototype.create = function () {
		//Check if we have loaded the file successfully
	}

	DefineTasks.prototype.update = function () {
		
	}

	DefineTasks.prototype.render = function () {
		//this.game.debug.geom(this.point,'rgba(0,0,0,1)');
	}

	/**
	* CALLBACKS
	*/	

	//Return the class copnstructor reference
	return DefineTasks;		
});