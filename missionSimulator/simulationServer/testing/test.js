var child_process = require('child_process');

var SUBTEST_COUNT = 20;
var pagesByChild = 5;
var target = 'http://aida.ii.uam.es:8888';

var subTestsFinished = 0;
var subTests = [];


function createSubTest () {
	var activeChild = child_process.fork(__dirname + '/serverStaturationScript',[target, pagesByChild]);


	activeChild.on('message', function(m) {

		subTestsFinished++;

		if (subTestsFinished > SUBTEST_COUNT) {
			console.log('FINITO!!!');
			//process.exit(0);
		}
		else {
			createSubTest();
		}

	});
}

createSubTest();