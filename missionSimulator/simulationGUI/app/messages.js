define(['app/constants','app/game'], function (Constants) {

	var messages = {
		captured: {
			text: 'Capturados : ',
			position : {
				x: Constants.stage.width - 160,
				y: 40
			},
			style: {
		        font: "20px Arial",
		        fill: "#ff0044",
		        align: "center"			
			}
		},
		rescued: {
			text: 'Rescatados : ',
			position : {
				x: Constants.stage.width - 160,
				y: 65
			},			
			style: {
		        font: "20px Arial",
		        fill: "#ff0044",
		        align: "center"			
			}		
		},
		inCoast: {
			text: 'En costa : ',
			position : {
				x: Constants.stage.width - 160,
				y: 90
			},			
			style: {
		        font: "20px Arial",
		        fill: "#ff0044",
		        align: "center"			
			}			
		}
	};

	return messages;
});