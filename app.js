/*************************************************
* MAIN MODULE - ENTRY POINT
**************************************************/

//Base require, to be able to require base project scripts from anywhere
require('./baseRequire');
var ConfigurationParameters = baseRequire('/conf/ConfigurationParameters');

//Custom profiler configuration (Local storage)
if (process.argv[2] == '--profiler=true') {
  require('./missionSimulator/simulationServer/profiler/profiler').start(1111,'0.0.0.0',{
    mongoSaving : {
      host : 'localhost',
      port: 27017,
      db: 'RealMetrics'
    }
  });
}

/**************************************************
/*** NODE.JS REQUIREMENTS (MAIN DEPENDENCIES)
**************************************************/
var fs = require('fs');
var _ = require('lodash');

var express = require('express'),
    bodyParser  = require("body-parser"),
    methodOverride = require("method-override");

var http = require('http');
var io = require('socket.io');
var mongoose = require('mongoose');

/**
 * Server creation (Express)
 * @type {*|exports}
 */
var app = express();
var server = http.createServer(app);

/**
 * Server configuration
 */
//Read and save the index html files of each part of the simulator, so that Express can send them (Plain HTML)
var entryPointFile = fs.readFileSync(__dirname + '/entryPoint/index.html','utf-8'); //Main index
var missionSimulatorGUIFile = fs.readFileSync(__dirname + '/missionSimulator/simulationGUI/index.html','utf-8'); //Mission simulator GUI index

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

/**
 * Files to serve statically
 */
app.use(express.static(__dirname + '/entryPoint/')); //Entry point files
app.use('/simulationGUI',express.static(__dirname + '/missionSimulator/simulationGUI/')); //Mission simulator
app.use('/bower_components',  express.static(__dirname + '/bower_components')); //Bower components
app.use('/node_modules',  express.static(__dirname + '/node_modules')); //Node modules
app.use('/docs',express.static(__dirname + '/docs'));   //Documentation

/**
 * Database connections
 **/
//TODO :Set environment

if (ConfigurationParameters.useDB) {
    var DBConnections = baseRequire('/conf/DBConnections');
    DBConnections.initMongooseConnections();

    // If the Node process ends, close all database connections
    process.on('SIGINT', function () {
        DBConnections.closeConnections();
        process.exit(0);
    });
}

/**
 * Routes
 */
//General routes (Index file)
var router = express.Router();

router.get('/', function(req,res) {
  res.send(entryPointFile);
});
router.get('/missionSimulator/', function (req,res) {
  res.send(missionSimulatorGUIFile);
});
app.use(router);

//Load API routes from another routes file (This routes use DB connections)
if (ConfigurationParameters.useDB) {
    app.use('/api',require('./API/routes'));
}

//Creates the websocket server and and the simulation game engine that will use it
var socketServer = io.listen(server);
var gameEngine = require('./missionSimulator/simulationServer/server');

//Load the data model files to use them in other modules
if (ConfigurationParameters.useDB) {
    var models_path =
        [
            __dirname + '/API/models/UAS_Configuration',
            __dirname + '/API/models/UAS_Info',
            __dirname + '/API/models/UAS_MissionInput',
            __dirname + '/API/models/UAS_MissionPlan',
            __dirname + '/API/models/DWR'
        ];
    _(models_path).forEach(function (path) {
        fs.readdirSync(path).forEach(function (file) {
            if (~file.indexOf('.js')) require(path + '/' + file)
        });
    });
}

//Start the simulation websocket framework
gameEngine.init(socketServer);

//this server also serves the HTML5 game stored in /public
server.listen(  ConfigurationParameters.mainServer.port,
                ConfigurationParameters.mainServer.host);

console.log("***************** Starting server on port " +
            ConfigurationParameters.mainServer.port +
            "*************************");
