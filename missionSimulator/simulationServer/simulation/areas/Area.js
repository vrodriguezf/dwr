//Dependencies
var _ = require('lodash');
var GeomPoly = require('geom-poly');
var PointInPolygon = require('point-in-polygon');
var Region = require('./utils/Region');
var Contour = require('./utils/Contour');

/************************
* AREA CLASS
*************************/

//Constructor
function Area(id,vertices,options) {
	if (!(vertices instanceof Array)) {
		//TODO: Log error
		return;
	}

	this.id = id;
	this.vertices = vertices;

	//Create the internal polygons
	this.polygon = [];
	for (var i=0;i<vertices.length; i++) {
		this.polygon.push([vertices[i].x,vertices[i].y]);
	}
	
}

Area.prototype.contains = function (x,y) {

	return PointInPolygon([x,y], this.polygon);
};

/**
 * Calculates the centroid of this area using the GeomPoly library.
 * @returns {{x: *, y: *}}
 */
Area.prototype.centroidPoint = function () {

	//SPECIAL CASE : Polygon length = 1
	if (this.vertices.length == 1)  {
		return this.vertices[0];
	}

	/*
	var geomPolyInstance = GeomPoly.make();
	_(this.vertices).forEach(function (vertex) {
		GeomPoly.add(geomPolyInstance,vertex.x,vertex.y);
	});
	GeomPoly.close(geomPolyInstance);

	var centroidVec = GeomPoly.centroid(geomPolyInstance);
	*/

	/*
	return {
		x : centroidVec[0],
		y : centroidVec[1]
	}
	*/
	//console.log(centroidVec);

	var centroidPoint = new Region(this.vertices).centroid();
	/*
	/*
	console.log(new Region([
		{ x: 346.9412, y: 4319.2635 },
		{ x: 346.9412, y: 4319.26352 },
		{ x: 346.9413, y: 4319.26352 },
		{ x: 346.9413, y: 4319.2635 }
	]).centroid());
	*/
	/*
	console.log(new Contour([
		{ x: 46.9412, y: 19.2635 },
		{ x: 46.9412, y: 19.26352 },
		{ x: 46.9413, y: 19.26352 },
		{ x: 46.9413, y: 19.2635 }
	]).centroid());
	*/
	return centroidPoint;
};

module.exports = Area;