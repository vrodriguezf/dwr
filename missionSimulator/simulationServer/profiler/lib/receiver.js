var events = require('events');
var util = require('util');

var mongoose = require('mongoose');

var MetricSchema = new mongoose.Schema({},{strict : false});
var MetricModel = mongoose.model('metrics', MetricSchema);

var Receiver = function (options) {
	events.EventEmitter.call(this);
	this.sockets = {};
	this.data = [];

	this.db = null;
	if (options && options.mongoSaving) {
		mongoose.connect('mongodb://' + 
							options.mongoSaving.host + 
							'/' + 
							options.mongoSaving.db);

		this.db = mongoose.connection;

		this.db.on('error', console.error.bind(console,'connection error:'));
		this.db.once('open', function () {
			console.log('Profiler connected to MongoDB local storage....saving metrics locally');
		});
	}
};

util.inherits(Receiver, events.EventEmitter);

Receiver.prototype.addSocket = function (socket) {
	var that = this;

	this.sockets[socket.id] = socket;

	socket.emit('commands', this.data);

	this.emit('request', { cmd: 'init', args: { socket: socket.id } });

	socket.on('command', function (data) {
		that.emit('request', data);
	});

	socket.on('disconnect', function () {
		socket.removeAllListeners('disconnect');
		socket.removeAllListeners('message');
		delete(that.sockets[socket.id]);
	});
};

Receiver.prototype.send = function (data) {

	if (data.cmd === 'init') {
		this.sockets[data.args.socket].emit('commands', [ data ]);
		return;
	}

	//Save the data
	if (this.db) {
		var newMetric = new MetricModel({
			scope : data.args.scope,
			name : data.args.name,
			value: data.args.value,
			op : data.args.op,
			history: data.args.history,
			source : data.args.source,
			_ns : data.args._ns,
			_ts : data.args._ts,
			createdAt : new Date()
		});
		newMetric.save();
	}

	this.data.push(data);
	if (this.data.length > 512) this.data.shift();
	for (var id in this.sockets) {
		this.sockets[id].emit('commands', [ data ]);
	}
};

module.exports = Receiver;