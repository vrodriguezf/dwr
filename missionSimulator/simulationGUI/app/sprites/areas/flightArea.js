define(['Phaser',
		'./area',
		'app/utils/converters'],
		 function (Phaser,Area,Converters) {

	function FlightArea(game,graphics,serverVertices,entryPoint,exitPoint) {
		this.entryPoint = Converters.getGamePoint(entryPoint);
		this.exitPoint = Converters.getGamePoint(exitPoint);

		Area.call(this,game,graphics,serverVertices);
	}

	//Inheritance
	FlightArea.prototype = Object.create(Area.prototype);
	FlightArea.prototype.constructor = FlightArea;

	//Replace draw method
	FlightArea.prototype.draw = function () {
	    this.graphics.beginFill(0x81D16F,0.3);
	    //this.graphics.lineStyle(5, 0xffd900, 0.5);		

	    Area.prototype.draw.call(this);
	};

	return FlightArea;
});