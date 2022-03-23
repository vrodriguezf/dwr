/**********************************************
* Online Data analiysis
***********************************************/
var events = require('events');
var Constants = projRequire('/Constants');


function OnlineDataAnalyzer (DRM,gameplayId) {

	var self = this;

	DRM.on(Constants.DRM.dataEventName, function (data) {
		self.handleDRMData(data);
	});

	this.gameplayId = gameplayId;
}

//Extends this
OnlineDataAnalyzer.prototype.handleDRMData = function (data) {}

module.exports = OnlineDataAnalyzer;