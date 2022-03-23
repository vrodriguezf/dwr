/**************************
** LOGGER CLASS (TODO: Think it as an intermediary to a NodeJS Logger?)
***************************/
var ClientLogMessage = require('./ClientLogMessage');
var InternalLogger = require('project-logger');
var LogLevels = require('./LogLevels');

// CONSTRUCTOR (Doesn't need to include the gameplay instance, 
// but it could be added as a constructor parameter (just like the DRM class does))
function GameplayLogger(gameplay) {

	//Class members
	this.gameplay = gameplay;

	//Internal server logger (https://github.com/lltwox/project-logger)
	this.serverLogger = new InternalLogger({
		name : 'Gameplay ' + gameplay.id,
		level: InternalLogger.LEVEL_DEBUG,
		transports : {
			console: true
		},
		colors: true
	});

	//This log must be refreshed each game-update
	this.clientLog = [];
}

GameplayLogger.prototype.log = function(message, level) {

	//The server logs works internally by using a third-party logger (TODO - Add level-logic)
	if (level && level.key == LogLevels.DEBUG.key) {
		this.serverLogger.debug(message); //DEBUG		
	}
	else if (level && level.key == LogLevels.ERROR.key) {
		this.serverLogger.error(message);
	} else {
		this.serverLogger.log(message);
	}

	//Adds the message to the client log array (in the client-log format)
	if (!level || level.key != LogLevels.DEBUG.key) {
		this.clientLog.push(new ClientLogMessage(message,this.gameplay.gameStatus.time.simulationTotal,level));		
	}
}

//Returns the client log stored and set it empty
GameplayLogger.prototype.getAndRefreshClientLog = function() {

	//Duplicate the client log array in a fast way
	// http://stackoverflow.com/questions/3978492/javascript-fastest-way-to-duplicate-an-array-slice-vs-for-loop
	var auxClientLog = this.clientLog.slice();

	this.clientLog = [];

	return auxClientLog;
}

module.exports.GameplayLogger = GameplayLogger;

/**
* Call this method from any module to get the logger associated to a gameplay instance, given 
* the gameplay ID
**/
module.exports.get = function(gameplayId) {
	return global.gameplaysMap.get(gameplayId).logger
}
