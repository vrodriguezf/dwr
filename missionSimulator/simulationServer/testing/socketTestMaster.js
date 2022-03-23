var child_process = require('child_process');

var SUBTEST_COUNT = 20;
var subTests = [];
var subTestsFinished = 0;
var executionPath = '/socketTest'; //Relative to __dirname

function createSubTest () {
	var activeChild = child_process.fork(__dirname + executionPath,[]);

	activeChild.on('message', function(m) {

		subTestsFinished++;

		if (subTestsFinished > SUBTEST_COUNT) {
			console.log('FINITO!!!');
			//process.exit(0);
		}
		else {
			console.log('Executing subtest number ' + subTestsFinished + ' ...');			
			createSubTest();
		}

	});
}

console.log('Executing subtest number ' + subTestsFinished + ' ...');
createSubTest();