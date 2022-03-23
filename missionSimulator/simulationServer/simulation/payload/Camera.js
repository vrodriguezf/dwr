/*****************************************
* CAMERA CLASS
*****************************************/
var PayloadElement = require('./PayloadElement');

const PAYLOAD_TYPE = 'camera';

const 	DEFAULT_CAMERA_TYPE = 'infrared_sensor',
		DEFAULT_FOCAL_LENGTH = 40,
		DEFAULT_LENS_RATIO = 20;

function Camera (id,initData) {

	PayloadElement.call(this,id,PAYLOAD_TYPE);

	this.cameraType = (initData && initData.camera_type)
		?	initData.camera_type
		: 	DEFAULT_CAMERA_TYPE;

	this.focalLength = (initData && initData.focal_length)
		?	initData.focal_length
		: 	DEFAULT_FOCAL_LENGTH;

	this.lensRatio = (initData && initData.lens_ratio)
		?	initData.lens_ratio
		: 	DEFAULT_LENS_RATIO;

	this.modes = (initData && initData.modes)
		?	initData.modes 
		: 	[];

	//This value is set up by the owner of the camera (a Drone instance)
	this.surfaceFocusRatio = undefined;

	//Currently, this payload element is not used in DWR (Set as disabled)
	this.disable();
}

//Inheritance
Camera.prototype = Object.create(PayloadElement.prototype);
Camera.prototype.constructor = Camera;

Camera.prototype.enable = function () {
	return;
};

module.exports = Camera;
