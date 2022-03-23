define(['Phaser','app/constants'],function(Phaser,Constants){


console.log('Screen height: ' + window.innerHeight);
			console.log('Game container width: ' + document.getElementById('gameContainer').offsetWidth);
			console.log('Game container height: ' + document.getElementById('gameContainerRow').offsetHeight);

  var game = new Phaser.Game(	document.getElementById('gameContainer').offsetWidth,
  								document.getElementById('gameContainerRow').offsetHeight,
  								Phaser.CANVAS,
  								'gameContainer');

  Constants.stage.width =  document.getElementById('gameContainer').offsetWidth;
  Constants.stage.height =  document.getElementById('gameContainerRow').offsetHeight;  
 
  return game;

});