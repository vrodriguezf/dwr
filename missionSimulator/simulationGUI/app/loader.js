define(['require','Phaser','app/game','app/states/menu','app/states/defineTasks','app/states/planSimulation/watchAndRescue'],function (require,Phaser,game,MenuState,DefineTasksState,WatchAndRescueState) {

	//var watchAndRescueState = require('app/states/watchAndRescue.js');

	var loader = {
		start: function() {

			game.state.add('Menu',new MenuState());
			game.state.add('DefineTasks', new DefineTasksState());
			game.state.add('Watch&Rescue',new WatchAndRescueState());

			//game.state.start('Menu');
			game.state.start('Watch&Rescue');
		}
	};

	return loader;
});