module.exports = {
	//Returns true or false if the 
	checkDroneCollision : function (drone, area) {
		if (area.contains(drone.position.x,drone.position.y)) {
			return true;
		}
		else return false;
	}
}