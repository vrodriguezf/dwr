define([], function () {

	var OK_CODE = 0;
	var OK_MSG = 'Success';

	var ERROR_CODE = -1;
	var NO_SOCKET_ERROR_MSG = 'No socket found';


	function sendClientInput(input) {
		if (!socket) {
			return {
				status: ERROR_CODE,
				message: NO_SOCKET_ERROR_MSG
			}
		}

		socket.emit('client-input',[input]);

		return {
			status: OK_CODE,
			message : OK_MSG
		}		
	}

	var clientAPI = {

		setControlMode : function (controlModeId) {
			return sendClientInput({
				name: 'setControlMode',
				params: {
					controlModeId : controlModeId
				}
			});			
		},

		/**
		* Set an specified path for an specified drone
		* TODO: Check if the params are properly introduced
		**/
		setPath: function (droneId, waypoints,options) {
			return sendClientInput({
				name: 'setPath',
				params: {
					droneId: droneId,
					waypoints: waypoints,
					options : options
				}
			});
		},

		addWaypoint: function (droneId,waypoint,index,options) {

			//Error control (Each parameter has correct fields?)
			if (droneId == null || waypoint == null || index < 0) return;

			return sendClientInput({
				name : 'addWaypoint',
				params : {
					droneId : droneId,
					waypoint: waypoint,
					index : index,
					options : options
				}
			});
		},

		setWaypoint: function (droneId,waypointId,waypoint) {
			return sendClientInput({
				name: 'setWaypoint',
				params: {
					droneId: droneId,
					waypointId : waypointId,
					waypoint : waypoint
				}
			});
		},

		/*
		* Focus on an specified drone
		*/
		selectDrone: function (droneId) {
			return sendClientInput({
				name: 'selectDrone',
				params: {
					droneId: droneId
				}
			});
		},

		/*
		* Select a waypoint of an specific drone
		* NOTE: This command is only useful for human-interface controllers (Not an IA)
		*/
		setWaypointSelection: function (droneId,waypointId,selected) {
			return sendClientInput({
				name: 'setWaypointSelection',
				params: {
					droneId : droneId,
					waypointId: waypointId,
					selected : selected
				}
			});
		},

		/**
		* Set the relation between the real time and the simulation time (Default = 1)
		*/
		setSimulationTimeRatio : function (simulationTimeRatio) {

			if (simulationTimeRatio ==  null || simulationTimeRatio < 0) {
				return {
					status : ERROR_CODE,
					message: 'Invalid parameters'
				}
			}

			return sendClientInput({
				name : 'setSimulationTimeRatio',
				params: {
					simulationTimeRatio : simulationTimeRatio
				}
			});
		}		
	};

	return clientAPI;
});