var OnlineDataAnalyzer = require('../OnlineDataAnalyzer');

function OnlineAttentionLevelAnalyzer (DRM,gameplayId) {
	OnlineDataAnalyzer.call(this,DRM,gameplayId);
}

OnlineAttentionLevelAnalyzer.prototype = Object.create(OnlineDataAnalyzer.prototype);
OnlineAttentionLevelAnalyzer.prototype.constructor = OnlineAttentionLevelAnalyzer;

OnlineAttentionLevelAnalyzer.prototype.handleDRMData = function (data) {
	//console.log('Me llegan cosas!!!!');
}

module.exports = OnlineAttentionLevelAnalyzer;