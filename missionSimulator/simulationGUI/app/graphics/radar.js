define(['Phaser',
		'app/props',
		'app/utils/helpers',
		'app/utils/converters'],
		 function (Phaser, Props, Helpers, Converters) {

	function Radar(game,drone,id) {
		Phaser.Graphics.call(this,game,drone.x,drone.y);

		this.id = id;
		this.drone = drone;
		this.lineStyle(0);
    	this.beginFill(0xFFFF0B, 0.3);
		this.drawCircle(0,0,0);
		this.z = Props.zOrder.indexOf('radar');
	}

	//Inheritance
	Radar.prototype = Object.create(Phaser.Graphics.prototype);
	Radar.prototype.constructor = Radar;

	Radar.prototype.updateFromServer = function (data) {

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

	Radar.prototype.redraw = function () {

		//Search for this camera in the drone server data

		var serverRadar = Helpers.getById(this.drone.data.payload,this.id);

		if (!serverRadar) return -1;

		if (serverRadar.ratio != null) {
			this.graphicsData[0].points[2] = Converters.worldKmToWorldPixel(serverRadar.ratio);
			this.graphicsData[0].points[3] = Converters.worldKmToWorldPixel(serverRadar.ratio);						
		}
	}

	return Radar;
});