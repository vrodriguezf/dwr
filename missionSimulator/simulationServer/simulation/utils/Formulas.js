module.exports = {

	getCameraFocalizedRatio : function (camera,altitude) {
		return (camera.lensRatio*(altitude + camera.focalLength))/camera.focalLength;
	}
}