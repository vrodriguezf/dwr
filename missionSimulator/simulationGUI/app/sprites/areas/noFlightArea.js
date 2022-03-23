define(['Phaser',
		'./area',
		'app/utils/converters',
		'app/styles'],
		 function (Phaser,Area,Converters,Styles) {

	function NoFlightArea(game,graphics,serverVertices) {

		Area.call(this,game,graphics,serverVertices);
	}

	//Inheritance
	NoFlightArea.prototype = Object.create(Area.prototype);
	NoFlightArea.prototype.constructor = NoFlightArea;

	//Replace draw method
	NoFlightArea.prototype.draw = function (color, transparency) {

		if (color!= null && transparency!= null) {
			this.graphics.beginFill(color,transparency);
		} else {
	    	this.graphics.beginFill(Styles.areas.noFlightArea.color,
	    							Styles.areas.noFlightArea.alpha);			
		}

	    Area.prototype.draw.call(this);
	}

	return NoFlightArea;
});