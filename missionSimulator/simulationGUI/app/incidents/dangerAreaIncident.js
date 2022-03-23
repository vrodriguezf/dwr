define(['Phaser',
		'./incident',
		'app/sprites/areas/noFlightArea',
		'app/styles'],

		 function (Phaser,Incident,Area,Styles) {

	function DangerAreaIncident (id,game,data) {
		Incident.call(this,id,game,data);

		var areaVertices = (data && data.area.vertices)
			?	data.area.vertices
			: 	[];

		var incidentGraphics = game.add.graphics(0,0);

		this.area = new Area(game,incidentGraphics,areaVertices);
		this.draw(); //mmmmmm...
	}

	//Inheritance
	DangerAreaIncident.prototype = Object.create(Incident.prototype);
	DangerAreaIncident.prototype.constructor = DangerAreaIncident;

	DangerAreaIncident.prototype.updateFromServer = function (data) {

		Incident.prototype.updateFromServer.call(this,data);
	}	

	DangerAreaIncident.prototype.draw = function () {
		if (this.area) {
			this.area.draw(Styles.incident.dangerArea.color, Styles.incident.dangerArea.alpha);
		}
	}

	DangerAreaIncident.prototype.finish = function () {
		//Destroy area graphics
		this.area.destroy();

		Incident.prototype.finish.call(this);
	}

	return DangerAreaIncident;
});