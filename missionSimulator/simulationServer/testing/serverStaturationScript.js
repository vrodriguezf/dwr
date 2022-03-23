var http = require('http');
var phantom = require('phantom');

var DEFAULT_CONN_LIMIT = 10;
var timeBetweenConnections = 60000; //ms

var currentConnections = 0;
var connectionLoop = null;

var target = (typeof(process.argv[2]) !== 'undefined' && process.argv[2] !== 'undefined') ? process.argv[2] : 'http://aida.ii.uam.es:8888';
var connLimit = (typeof(process.argv[3]) !== 'undefined' && process.argv[3] !== 'undefined') ? process.argv[3] : DEFAULT_CONN_LIMIT;

function createPage(ph) {
	ph.createPage(function (page) {
	    page.open(target, function(){
	    	currentConnections++; 
			//Evaluate page
			page.evaluate(function () { return document.title; }, function (result) {

				if (result) {
					console.log('Page ' + currentConnections + ' loaded ' + result + ' successfully');									
				
				} else {
					console.log('Error loading page ' + currentConnections);
				}

			});

			if (currentConnections >= connLimit) {
				clearInterval(connectionLoop);
				console.log('TEST FINISHED');
				process.send({});
			}    	
	    });		
	})
}

console.log('STARTING SATURATION TEST');
phantom.create(function (ph) {
	connectionLoop = setInterval(createPage,timeBetweenConnections,ph);
});