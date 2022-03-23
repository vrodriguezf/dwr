// init projRequire
require('./projRequire');

module.exports = (function(){

/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var mongoose = require('mongoose');
var util = require("util"),					// Utility resources (logging, object inspection, etc)
	//io = require("socket.io"),			// Socket.IO
	Gameplay = projRequire("/Gameplay");		// Gameplay class
var GameplayUtils = projRequire('/GameplayUtils').GameplayUtils;
var HashMap = require('hashmap').HashMap;
var GameplayLogger = projRequire('/logger/GameplayLogger').GameplayLogger;
var DRM = projRequire('/drm/DRM').DRM;

/**************************************************
** SIMULATION SOCKET SERVER VARIABLES
**************************************************/
var DEFAULT_MISSION_PLAN = 'testMission01';

/**************************************************
** SIMULATION SOCKET SERVER VARIABLES
**************************************************/
var socketServer,
	gameplays,	// Array of current games in execution (TODO: think if it's necessary now taht we have the gameplays map)
	idCounter = 0;	//Increases with every new connection

/**************************************************
** SIMULATION SOCKET SERVER EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Socket.IO
	socketServer.sockets.on("connection", onSocketConnection);
};

//New socket connection
function onSocketConnection(clientSocket) {
	util.log("New player connected: " + clientSocket.id);

	//Listen for new gameplay connections
	clientSocket.on('client-newGameplay',onNewGameplay);

	// Listen for client disconnected
	clientSocket.on("disconnect", onClientDisconnect);
}

//The client ask for a new gameplay
function onNewGameplay(initData) {

	//Create the gameplay if it doesn't exist
	var newGameplay = new Gameplay(idCounter++,this);

	//Add the new gameplay global objets to the global gameplays map
	global.gameplaysMap.set(newGameplay.id,{
		utils : new GameplayUtils(newGameplay),
		drm : new DRM(newGameplay, {dataAnalysis: true}),
		logger: new GameplayLogger(newGameplay)
	});

	//Add new gameplay to the gameplays array
	gameplays.push(newGameplay);

	//Init the gameplay loading the mission received as a socket parameter
	var missionPlan = (initData && initData.missionPlanId)
		?	initData.missionPlanId
		: 	DEFAULT_MISSION_PLAN;

	var missionPath = __dirname + '/assets/data/' + missionPlan + '/';


	//Init the gameplay (Init ->Start) (Test mission or Real DB Mission)
	if (initData.test == 1) {
		//Test mission
		newGameplay.initTestMission({
			environmentFilePath : missionPath + 'environment.json',
			targetsFilePath : missionPath + 'targets.json',
			plansFilePath : missionPath + 'plans.json',
			scenarySchedulerId : initData.scenarySchedulerId,
			mode: initData.mode,
			incidentsPlanId: initData.incidentsPlanId,
			missionPlanId: initData.missionPlanId,
			name: initData.name
		});
	} else {
		//Real mission
		newGameplay.initRealMission({
			missionPlanId : initData.missionPlanId,
			scenarySchedulerId : initData.scenarySchedulerId,
			mode: initData.mode,
			incidentsPlanId: initData.incidentsPlanId,
			name: initData.name
		});
	}
}

// Socket client (this refers to the socket object)
function onClientDisconnect() {
	util.log("Gamer disconnected from gameplay: " + this.id);

	var gameplay = gameplayBySocketId(this.id);

	//Gameplay not found
	if (!gameplay) {
		util.log("Gameplay not found: " + this.id);
		return;
	};

	//If the gameplay is started, finish the game (TODO: We should differenciate between terminate and finish)
	//TODO: Analyze if disconnect = finish gameplay
	
	if (gameplay.gameStarted) {
		gameplay.finish();
	}

	//Remove gameplay from the gameplays array
	gameplays.splice(gameplays.indexOf(gameplay),1);

	//Remove gameplay from the gameplays map
	global.gameplaysMap.remove(gameplay.id);

	console.log('Gameplay ' + gameplay.id + ' terminated successfully');	
}

/**************************************************
** SIMULATION SOCKET SERVER HELPER FUNCTIONS
**************************************************/

// Find gameplay by ID
function gameplayBySocketId(socketId) {
	var i;
	for (i = 0; i < gameplays.length; i++) {
		if (gameplays[i].socket.id == socketId)
			return gameplays[i];
	};
	
	return false;
};

/**************************************************
** SIMULATION SOCKET SERVER INITIALISATION
**************************************************/
var gameServer = {
	init: function(socketServerParam) {
		socketServer = socketServerParam;

		// Create an empty array to store players
		gameplays = [];

		//Creates the GLOBAL gameplays map
		global.gameplaysMap = new HashMap();

		// Start listening for events
		setEventHandlers();
	}
};

return gameServer;
}());
