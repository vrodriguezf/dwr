define(['Phaser',
		'app/constants',
		'app/props',
		'app/utils/converters',
		'app/styles'],
		 function (Phaser,Constants,Props, Converters, Styles) {

	function Waypoint(game,x,y,assetKey) {

		//Super constructor
		Phaser.Sprite.call(	this,
								game,
								Converters.cartesianXToGameX(x),
								Converters.cartesianYToGameY(y),
								assetKey, //WTF?!?!
								0);

	    this.inputEnabled = true;

		this.anchor.setTo(0.5,0.5);
		this.exists = false;

		this.isDragging = false;
		this.data = null;
		this.index = null;

		//Set the waypoint default appearance (When we receive data from the server this changes)
		this.changeType(null);

		this.waypointLabel = new Phaser.Text(game,	this.width*Constants.drone.waypoint.scale.x,
													this.height*Constants.drone.waypoint.scale.y,
													'0',
													Styles.waypointLabel);
		//this.waypointLabel.anchor.setTo(0.5,0.5);

		this.addChild(this.waypointLabel);

		//Events
		this.events.onDragStart.add(OnWaypointDragStart,this);
	}

	//Inheritance
	Waypoint.prototype = Object.create(Phaser.Sprite.prototype);
	Waypoint.prototype.constructor = Waypoint;

	Waypoint.prototype.updateFromServer = function (data,index) {

		//Check when we should not update from server
		if (!data || this.isDragging) {
			return;
		}

		//Check if we must change the waypoint type appereance
		if (this.data ==null || data.type!=this.data.type) {
			this.changeType(data.type);
		}

		if (this.index==null || this.index!=index) {
			this.setIndex(index);
		}

		this.x = Converters.cartesianXToGameX(data.x);
		this.y = Converters.cartesianYToGameY(data.y);

		//Update waypoint label
		if (index!=this.index) {
			this.setIndex(index);
		}

		this.data = data;
	}

	Waypoint.prototype.changeType = function (type) {
		//Change the waypoint sprite color depending on the waypoint type
		if (type == 'refueling') {
			this.tint = 0x000000;
		}
		else if (type == 'land') {
			this.tint = 0x000000;
		}
		else if (	type == 'action' ||
					type=='surveillance' ||
					type == 'reconnaissance' ||
					type == 'tracking' ||
					type=='mapping' ||
					type=='monitoring')  {
			this.tint = 0x00ff00;
		}
		else {
			this.tint = 0xffffff;
		}

		if (type == 'refueling' || type == 'land') {
			this.input.disableDrag();
			this.input.useHandCursor = false;
		} else {
			this.input.enableDrag();
			this.input.useHandCursor = true;
		}
	}

	Waypoint.prototype.setIndex = function (index) {
		this.index = index;
		this.waypointLabel.setText((index!=null ? index+1 : ''));

	}

	//CALLBACKS
	function OnWaypointDragStart(sprite,pointer) {
		this.isDragging = true;
	}

	return Waypoint;
});