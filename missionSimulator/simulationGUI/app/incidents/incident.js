define(['Phaser',
		'./incidentStatus',	
		'app/styles',
		'app/constants'],
	 function (Phaser,IncidentStatus,Styles,Constants) {

	function Incident (id,game,data) {
		this.id = id;
		this.game = game;
		this.data = data;
		this.finished = false;

		this.screenMessage = null;
		//Sets if the incident is being notified at the moment
		this.notifying = false;
		this.notificationStartTime = null;
		this.timeSinceNotificationStartTime = 0;
	}

	Incident.prototype.updateFromServer = function (data) {

		//Update the screen message
		if (this.notifying) {
			this.timeSinceNotificationStartTime += this.game.time.elapsedSecondsSince(this.notificationStartTime);

			if (this.timeSinceNotificationStartTime >= Constants.incident.screenMessage.notificationDuration) {
				this.finishNotification();
			}
		}

		//Finish incident!?!?
		if (data.status == IncidentStatus.INACTIVE) {
			this.finish();
		}		

		this.data = data;
	}

	Incident.prototype.finish = function () {
		this.finished = true;
		this.finishNotification();
	}

	// Starts the incident screen notification. The index (by default 0), indicates
	// the position in which the incident must be notified. This avoids notification collisions
	Incident.prototype.notify = function (_index) {
		var index = (_index != null) ? _index : 0;
		var screenMessagePosition = this.getScreenMessagePosition(index);

		this.screenMessage = new Phaser.Text(this.game,
												screenMessagePosition.x,
												screenMessagePosition.y,
												this.getScreenMessageText(),
												Styles.incident.screenMessage);

		this.screenMessage.fixedToCamera = true;

		//Add the text to the game
		this.game.add.existing(this.screenMessage);

		this.notifying = true;
		this.notificationStartTime = this.game.time.now;
		this.timeSinceNotificationStartTime = 0;
	}

	Incident.prototype.finishNotification = function() {
		this.notifying = false;

		if (this.screenMessage) {
			this.screenMessage.destroy();			
		}
	}

	//Internal calls only!
	Incident.prototype.getScreenMessagePosition = function (index) {
		var x = Constants.incident.screenMessage.initialStageOffset.x;
		var y = Constants.incident.screenMessage.initialStageOffset.y + 
				index*Constants.incident.screenMessage.messageHeight +
				index*Constants.incident.screenMessage.distanceBetweenMessages;

		return {x : x, y: y};
	}

	Incident.prototype.getScreenMessageText = function () {
		return this.data.level + ' : ' + this.data.message;
	}

	/*****************************
	* HELPERS & CALLBACKS
	******************************/

	return Incident;
});


