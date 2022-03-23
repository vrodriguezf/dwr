/*******************************************
* Human Ship CLASS (Inherits from Ship)
*******************************************/
var Ship = require('./Ship');

const SHIP_TYPE = 0; // Fake inheritance

//Contructor
function HumanShip(id,gameplayId,map) {
  	// Call the parent constructor, making sure (using Function#call) that "this" is
  	// set correctly during the call	
	Ship.call(this,id,gameplayId,SHIP_TYPE);

	this.map = map;
	this.type = SHIP_TYPE;
}

//Inheritance
HumanShip.prototype = Object.create(Ship.prototype);
HumanShip.prototype.constructor = HumanShip;

//Replace the update method
HumanShip.prototype.update = function (gameTime) {

	//Call the parent update method
	Ship.prototype.update.call(this, gameTime);
}

module.exports = HumanShip;