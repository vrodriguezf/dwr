var io = require('socket.io-client');

var sockets = [];
var SOCKET_LIMIT = 100;
var target = 'http://aida.ii.uam.es:8888';
var connectionLoop = null;
var timeBetweenConnections = 2000;

function createSocketConnection() {

	var currentSocketCount = sockets.length;

	if (currentSocketCount >= SOCKET_LIMIT) {
		console.log('REACHED SOCKET LIMIT');
		clearInterval(connectionLoop);

		//Send a message to the parent master (He acabado!)
		process.send({killMe : false, finished: true});
	}
	else {
		console.log('Trying to connect socket ' + currentSocketCount + ' ...');

		//console.log(require('socket.io-client')(target).io);
		var newSocket = io.connect(target, {'force new connection' : true});

		newSocket.on('connect', function () {
			console.log('Socket ' + currentSocketCount + 'connected successfully to the server');
			newSocket.emit('client-newGameplay', {});
		}, 
		function (e) {
			console.log('asdsad');
		});

		sockets.push(newSocket);
	}
}

connectionLoop = setInterval(createSocketConnection,timeBetweenConnections);