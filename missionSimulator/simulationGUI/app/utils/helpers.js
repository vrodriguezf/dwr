define(['app/utils/converters', 'app/constants'], function (Converters, Constants) {

	return  {

		/**
		* Calculate a good value of Scale given a world to display, and the stage (Phaser Stage) we use
		* to display that world
		*/
		calculateOptimalScale: function (worldBounds, stageBounds) {

			/*
			var boundToCompare = (worldBounds.width > worldBounds.height)
				?	'height'
				: 	'width';

			var worldBoundToCompare = (boundToCompare == 'height')
				?	worldBounds.height
				: 	worldBounds.width;
 			var stageBoundToCompare = (boundToCompare == 'height')
				?	stageBounds.height
				: 	stageBounds.width;
				 */
			var worldBoundToCompare = Math.min(worldBounds.width,worldBounds.height);
			var stageBoundToCompare = Math.max(stageBounds.width,stageBounds.height);

			var relationBetweenBounds = Constants.scale.worldAreaAndStageBoundRelation;

			console.log('Stage dimensions: (' + stageBounds.width + ',' + stageBounds.height + ') px');
			console.log('World dimensions: (' + worldBounds.width + ',' + worldBounds.height + ') px');
			console.log('Stage bound to compare: ' + stageBoundToCompare + 'px');
			console.log('World bound to compare: ' + worldBoundToCompare + 'px');

			return Math.max(1,Math.round((stageBoundToCompare*relationBetweenBounds)/worldBoundToCompare));
		},

		//Returns the element of "array" with a property called "id" matching with
		// the id passed as a parameter
		getById: function (array,id) {
			for (var i=0; i<array.length; i++) {
				if (array[i].id == id) {
					return array[i];
				}
			}

			return null;		
		},

		convertDMSToDD : function (degrees, minutes, seconds, direction) {
		    var dd = degrees + minutes/60 + seconds/(60*60);

		    if (direction == "S" || direction == "W") {
		        dd = dd * -1;
		    } // Don't do anything for N or E
		    return dd;
		},

		//Creates a wawypoint ready to send to the server
		createWaypointToSend: function (x,y,type,convertCoordinates) {

			var realWaypointPosition;

			if (convertCoordinates == null || convertCoordinates == true) {
				realWaypointPosition = Converters.gamePointToRealPoint({x:x,y:y});
			} else {
				realWaypointPosition = {x:x,y:y};
			}

			return  {
				x : realWaypointPosition.x,
				y : realWaypointPosition.y,
				type : (type !=null ) ? type : 'route'
			}
		}
	}	
});