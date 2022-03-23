define(['Phaser',
		'app/constants',
		'app/utils/converters'],
		 function (Phaser,Constants,Converters) {

	function Area(game,graphics,serverVertices) {

		this.game = game;
		this.graphics = graphics;

		if (!(serverVertices instanceof Array)) {
			console.log('Area : No se ha podido construir el area. Error en los parametros de construccion');
		}
		else {
			var gameVertices = getAreaGamePoints(serverVertices);
			this.gameVertices = gameVertices;
			//Super-constructor
			Phaser.Polygon.call(this,gameVertices);			
		}
	}

	//Inheritance
	Area.prototype = Object.create(Phaser.Polygon.prototype);
	Area.prototype.constructor = Area;

	//TODO -Recalculate points each time draw is called
	Area.prototype.draw = function (color,transparency) {
		// set a fill and line style
		if (color!= null && transparency!= null) {
			this.graphics.beginFill(color, transparency);
		}

		//Draw the figure!
		if (this.gameVertices.length == 1) {
			this.graphics.drawCircle(this.gameVertices[0].x,this.gameVertices[0].y,3);
		}
		else {
			this.graphics.drawPolygon(this);
		}
	};

	Area.prototype.destroy = function () {
		this.graphics.destroy();
	};

	//Callbacks and auxiliar functions
	function getAreaGamePoints(vertices) {
		if (!(vertices instanceof Array)) return null;

		var gameVertices = [];
		for (var i=0; i<vertices.length; i++) {
			gameVertices.push(Converters.clientCoordConverter(vertices[i]));
		}

		return gameVertices;
	}	

	// Exports the class
	return Area;
});