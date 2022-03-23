/**************************************
* CLIENT LOG MESSAGE - This class represents a log message in the way that should be
* sent to the game clients (GUI, IA...)
/*************************************/
var LogLevels = require('./LogLevels');
  
function ClientLogMessage(text,time,level) {
	this.text = text;

	this.time = (time!= null)
		?	time
		: 	0;

	this.level = (level != null)
		?	level	
		: 	LogLevels.INFO;

}

module.exports = ClientLogMessage;