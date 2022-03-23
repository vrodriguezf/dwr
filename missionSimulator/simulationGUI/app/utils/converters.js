define(['app/constants'], function (Constants) {

	return {
		//NOTE: AThis function doesn't care about the orientation of the world y axis
		worldPixelToWorldKm : function (worldPixel) {
			return (worldPixel / Constants.scale.pixelsPerKm);
		},

		worldKmToWorldPixel : function ( worldKm ) {

			return Math.round(worldKm*Constants.scale.pixelsPerKm);
		},

		cartesianXToGameX : function (cartesianX) {

			if (cartesianX == null) {
				console.log('Converters-ERROR');				
				return null;
			}			

			return this.worldKmToWorldPixel(cartesianX);
		},

		cartesianYToGameY : function (cartesianY) {


			if (cartesianY == null) {

				console.log('Converters-ERROR');				
				return null;
			}



			return -1*(this.worldKmToWorldPixel(cartesianY));
		},		

		cartesianPointToGamePoint : function (cartesianPoint) {
			if (cartesianPoint == null || cartesianPoint.x == null || cartesianPoint.y == null) {
				console.log('Converters-cartesianPointToGamePoint: ERROR');
				return null;
			}

			return {
				x: this.cartesianXToGameX(cartesianPoint.x),
				y :this.cartesianYToGameY(cartesianPoint.y)
			}
		},

		gameXToCartesianX : function ( gameX) {
			return this.worldPixelToWorldKm(gameX);
		},

		gameYToCartesianY : function (gameY) {
			return -1*(this.worldPixelToWorldKm(gameY));
		},

		gamePointToCartesianPoint: function (gamePoint) {
			if (gamePoint==null || gamePoint.x == null || gamePoint.y == null) {
				console.log('converters-error');
				return null;
			}

			return {
				x: this.gameXToCartesianX(gamePoint.x),
				y : this.gameYToCartesianY(gamePoint.y)
			}
		},

		getGamePoint : function (point) {
			//In this case, we always convert from cartesians to pixels
			return this.cartesianPointToGamePoint(point);
		},

		realPointToGamePoint : function (point) {
			//In this case, we always convert from cartesians to pixels
			return this.cartesianPointToGamePoint(point);
		},

		gamePointToRealPoint : function (gamePoint)	{
			//Real world = Cartesian
			return this.gamePointToCartesianPoint(gamePoint);
		},
		clientCoordConverter : function (point) {
			return this.cartesianPointToGamePoint(point);
		},
		serverCoordConverter : function (point) {
			return this.gamePointToCartesianPoint(point);
		}
	}
});