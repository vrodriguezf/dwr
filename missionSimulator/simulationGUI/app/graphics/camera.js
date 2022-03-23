define(['Phaser',
		'app/props',
		'app/utils/helpers',
		'app/utils/converters'],
		 function (Phaser, Props, Helpers, Converters) {

	function Camera(game,drone,id) {
		Phaser.Graphics.call(this,game,drone.x,drone.y);

		this.id = id;
		this.drone = drone;
		this.z = Props.zOrder.indexOf('cameras');
		this.lineStyle(1,0xFF0000,1);		
		this.drawCircle(0,0,0);
	}

	//Inheritance
	Camera.prototype = Object.create(Phaser.Graphics.prototype);
	Camera.prototype.constructor = Camera;

	Camera.prototype.updateFromServer = function (data) {

		//Graphic Position (drone position)
		this.x = this.drone.x;
		this.y = this.drone.y;

		//Enabled?
		if (data.enabled) {
			this.visible = true;
		} 
		else {
			this.visible = false;
		}
	}

	Camera.prototype.redraw = function () {

		//Search for this camera in the drone server data

		var serverCamera = Helpers.getById(this.drone.data.payload,this.id);

		if (!serverCamera) return -1;

		//The camera position is marked by the drone, but the ratio is recalculated by itself
		if (serverCamera.surfaceFocusRatio != null) {
			this.graphicsData[0].points[2] = Converters.worldKmToWorldPixel(serverCamera.surfaceFocusRatio);
			this.graphicsData[0].points[3] = Converters.worldKmToWorldPixel(serverCamera.surfaceFocusRatio);						
		}
	}

	return Camera;
});