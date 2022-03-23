/***************************************
* PAYLOAD_ELEMENT CLASS
***************************************/

function PayloadElement(id,payloadType) {
	this.id = id;
	this.payloadType = payloadType;
	this.enabled = true;
}

PayloadElement.prototype.enable = function () {
	this.enabled = true;
}

PayloadElement.prototype.disable = function () {
	this.enabled = false;
}

PayloadElement.prototype.update = function (gameTime) {
	
}

module.exports = PayloadElement;