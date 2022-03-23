define(['angular',
        'angularSocketIO',
        'angularBootstrap',
        'angularSlider',
        'angularScrollDown',
        'angularSelection',
        'moment',
        'lodash',

        './namespace',

        'app/constants',
        'ClientAPI',
        'sphericalMercator'
    ],

    function (angular, angularSocketIO, angularBootstrap, angularSlider, angularScrollDown, angularSelection, moment, _, namespace, gameConstants, ClientAPI, sphericalMercator) {

        var EPSILON_POSITION = 0.001,
            EPSILON_FUEL = 0.01,
            EPSILON_ALTITUDE = 0.01;

        var mercator = new SphericalMercator();
        //console.log(SphericalMercator);

        var controlPanelModule = angular.module(namespace, [
            'btford.socket-io',
            'ui.bootstrap',
            'vr.directives.slider',
            'luegg.directives',
            'selectionModel'
        ])

            .config(function () {
                console.log('Configuring ' + namespace + ' module...');
            })

            .run(function () {
                console.log('Running ' + namespace + ' module...');
            })

            .factory('mySocket', function (socketFactory) {

                mySocket = socketFactory({
                    ioSocket: socket 	//Global socket!
                });

                mySocket.sendInput = function (input) {
                    console.log('Socket-sending input...');
                    this.emit('client-input', [input]);
                }

                return mySocket;
            })

            .controller('droneCtrl', function ($scope, mySocket) {

                var droneIconsBasePath = window.baseUrl + 'assets/img/drones/';

                //Internal variables
                var simulationTimeRatioChanging = false;
                var droneSpeedChanging = false;

                //Scope variables
                $scope.isTestMission = false;
                $scope.coordConverter = undefined;  //Function to convert coordinates and show them in the screen

                $scope.layout = {
                    heightPercentages: {
                        header: 10,
                        main: 60,
                        sub: 15, //20 for big screens
                        footer: 5
                    },
                    scrollBodyPercentajes: {
                        waypointTable: 0.7,
                        console: 1.15
                    },
                    waypointTableMargin: 20,
                    scrollBodyPercentaje: 1
                };

                $scope.waypointScrollPanelHeight = $scope.getWaypointScrollPanelHeight;

                $scope.gameContainer = {
                    width: gameConstants.stage.width,
                    height: gameConstants.stage.height
                };
                $scope.waypoints = undefined;
                $scope.selectedWaypoints = [];
                $scope.logMessages = [];
                $scope.selectedDrone = null;
                $scope.currentControlModeId = null;

                //Socket message callbacks
                mySocket.forward('server-gameInit', $scope);
                $scope.$on('socket:server-gameInit', function (event, initState) {
                    $scope.drones = initState.drones;
                    $scope.simulationTimeRatio = initState.time.simulationTimeRatio;
                    $scope.addConsoleMessages(initState.log);
                    if (initState.test) {
                        $scope.isTestMission = true;
                        $scope.coordConverter = coordIndentity;
                    } else {
                        $scope.coordConverter = cartesiansToGeodesics;
                    }
                });

                mySocket.forward('server-gameUpdate', $scope);
                $scope.$on('socket:server-gameUpdate', function (event, state) {

                    /**
                     * Simulation Time ratio update
                     */
                    if (!simulationTimeRatioChanging && $scope.simulationTimeRatio != state.time.simulationTimeRatio) {
                        $scope.simulationTimeRatio = state.time.simulationTimeRatio;
                    }
                    /**
                     * Control mode update
                     */
                    if ($scope.currentControlModeId != state.controlMode.id) {
                        $scope.currentControlModeId = state.controlMode.id;
                    }
                    /**
                     * Drone information update
                     */
                    for (var i = 0; i < state.drones.length; i++) {
                        // To prevent continous DOM updates of the data that is continously changing, we establish a threshold,
                        // and only update the DOm when the data has changed
                        if (Math.abs($scope.drones[i].remainingFuel - state.drones[i].remainingFuel) > EPSILON_FUEL) {
                            $scope.drones[i].remainingFuel = state.drones[i].remainingFuel;
                        }
                        if (Math.abs($scope.drones[i].altitude - state.drones[i].altitude) > EPSILON_ALTITUDE) {
                            $scope.drones[i].altitude = state.drones[i].altitude;
                        }
                        if (Math.abs($scope.drones[i].position.x - state.drones[i].position.x) > EPSILON_POSITION) {
                            $scope.drones[i].position.x = state.drones[i].position.x;
                        }
                        if (Math.abs($scope.drones[i].position.y - state.drones[i].position.y) > EPSILON_POSITION) {
                            $scope.drones[i].position.y = state.drones[i].position.y;
                        }

                        if ($scope.drones[i].status.key != state.drones[i].status.key) {
                            $scope.drones[i].status = state.drones[i].status;
                        }

                        //We update the client speed if the server speed has changed and that speed is not changing
                        //on  the client
                        if ($scope.drones[i].speed != state.drones[i].speed) {
                            if (!$scope.selectedDrone || !($scope.selectedDrone.id == state.drones[i].id) || !droneSpeedChanging) {
                                $scope.drones[i].speed = state.drones[i].speed;
                            }
                        }
                    }
                    /**
                     * Drone selection update
                     */
                    if (state.selectedDrone == null) {
                        $scope.selectedDrone = null;
                        $scope.waypoints = undefined;
                    }
                    else if ($scope.selectedDrone == null
                        || (state.selectedDrone.id != $scope.selectedDrone.id)) {
                        $scope.selectedDrone = state.selectedDrone;
                        //Change waypoints too!!
                        $scope.waypoints = state.selectedDrone.waypoints;
                    }
                    /**
                     * Waypoint panel update (Only uf the drone changes, or there are changes in the waypoints)
                     */
                    //Only updates the waypoint clients if a waypoint has changed
                    if (state.selectedDrone && checkWaypointChanges($scope.waypoints, state.selectedDrone.waypoints)) {
                        $scope.waypoints = state.selectedDrone.waypoints;
                    }

                    //Log messages updates
                    $scope.addConsoleMessages(state.log);
                });

                /**********************************************************
                 * PAGE AUX
                 ***********************************************************/
                $scope.getMainTitle = function () {
                    //console.log(window.queryParams);
                    if (window.queryParams['mode'] == 'setInteractionsGuide') {
                        return "DWR-Training Guide"
                    } else {
                        return "DWR-Mission simulator"
                    }
                };

                $scope.getHeightByPercentage = function (percentage) {

                    return (percentage * window.innerHeight) / 100;
                    //return (percentage*$scope.gameContainer.height)/(layout.heightPercentages.main);
                };

                $scope.getWaypointScrollPanelHeight = function () {
                    console.log('adasdasd');
                    //console.log(angular.element('#waypointPanelHeading'));
                    return ($scope.getHeightByPercentage($scope.layout.heightPercentages.sub)) * $scope.layout.scrollBodyPercentajes.waypointTable;
                };

                /**************************************************************
                 * DRONE CONTROL
                 **************************************************************/
                $scope.setControlMode = function (controlModeId) {
                    ClientAPI.setControlMode(controlModeId);
                };

                $scope.selectDrone = function (drone) {
                    if (drone == null) return;

                    ClientAPI.selectDrone(drone.id);
                };

                $scope.setSelectedDroneSpeed = function () {
                    mySocket.sendInput({
                        name: 'setSpeed',
                        params: {
                            droneId: $scope.selectedDrone.id,
                            value: $scope.selectedDrone.speed
                        }
                    });
                    droneSpeedChanging = false;	//Finish change
                    console.log('Drone speed change input sent to the server ');
                };
                $scope.onSelectedDroneSpeedChange = function () {
                    droneSpeedChanging = true;
                };

                $scope.returnToAirport = function () {
                    if ($scope.selectedDrone != null) {

                        //Add a land waypoint (First waypoint)
                        $scope.waypoints.unshift({
                            x: $scope.selectedDrone.airport.position.x,
                            y: $scope.selectedDrone.airport.position.y,
                            type: 'land'
                        });

                        ClientAPI.setPath($scope.selectedDrone.id, $scope.waypoints);
                    }
                };

                /****************************************************************
                 * SIMULATION CONTROL
                 *****************************************************************/
                $scope.setSimulationTimeRatio = function () {
                    ClientAPI.setSimulationTimeRatio($scope.simulationTimeRatio);
                    simulationTimeRatioChanging = false;
                };

                $scope.onSimulationTimeRatioChange = function () {
                    simulationTimeRatioChanging = true;
                };

                /*****************************************************************
                 * WAYPOINT CONTROL
                 *****************************************************************/
                $scope.waypointSelectionChanged = function (waypoint) {

                    console.log($scope.selectedWaypoints);

                    if (waypoint == null) {
                        return;
                    }

                    //Only send the command when the event is fired from a manual user select or deselection
                    // There are also other events fired when the user selects a waypoint but these are not sent to the server
                    if (waypoint.selected || (!waypoint.selected && $scope.selectedWaypoints.length == 0)) {
                        ClientAPI.setWaypointSelection($scope.selectedDrone.id, waypoint.id, waypoint.selected);
                    }

                };

                $scope.waypointUp = function (waypoint) {

                    if (!$scope.waypoints || !waypoint) {
                        console.log('Waypoint error: Null');
                        return;
                    }

                    var waypointIndex = _.findIndex($scope.waypoints, {'id': waypoint.id});
                    if (waypointIndex == -1) {
                        console.log('Waypoint error: Mismatch');
                        return;
                    }

                    var aux = $scope.waypoints[waypointIndex];
                    $scope.waypoints[waypointIndex] = $scope.waypoints[waypointIndex - 1];
                    $scope.waypoints[waypointIndex - 1] = aux;

                    $scope.setWaypoints($scope.waypoints);
                };

                $scope.waypointDown = function (waypoint) {

                    if (!$scope.waypoints || !waypoint) {
                        console.log('Waypoint error: Null');
                        return;
                    }

                    var waypointIndex = _.findIndex($scope.waypoints, {'id': waypoint.id});
                    if (waypointIndex == -1) {
                        console.log('Waypoint error: Mismatch ' + waypoint.id);
                        return;
                    }

                    var aux = $scope.waypoints[waypointIndex];
                    $scope.waypoints[waypointIndex] = $scope.waypoints[waypointIndex + 1];
                    $scope.waypoints[waypointIndex + 1] = aux;

                    $scope.setWaypoints($scope.waypoints);
                };

                $scope.removeWaypoint = function (waypoint) {

                    if (!$scope.waypoints || !waypoint) {
                        console.log('Waypoint error: Null');
                        return;
                    }

                    var waypointIndex = _.findIndex($scope.waypoints, {'id': waypoint.id});
                    if (waypointIndex == -1) {
                        console.log('Waypoint error: Mismatch');
                        return;
                    }

                    $scope.waypoints.splice(waypointIndex, 1);
                    $scope.setWaypoints($scope.waypoints);
                };

                //Send edited waypoints to the server
                $scope.setWaypoints = function () {
                    mySocket.sendInput({
                        name: 'setPath',
                        params: {
                            droneId: $scope.selectedDrone.id,
                            waypoints: $scope.waypoints
                        }
                    });
                };

                /*************************************************************
                 * CONSOLE CONTROL
                 *************************************************************/
                $scope.addConsoleMessages = function (messages) {

                    if (messages.length == 0) {
                        return;
                    }

                    angular.forEach(messages, function (message) {
                        //Change the time format (ms -> moment.duration)
                        message.time = moment.duration(message.time);
                        $scope.logMessages.push(message);
                    });
                };

                /******************************************************************
                 * OTHER SCOPE FUNCTIONS
                 *****************************************************************/
                $scope.getDuration = function (time) {
                    return moment.duration(time, 'seconds');
                };

                $scope.formatTime = function (time) {
                    console.log(time);
                    if (isNumber(time)) {
                        var duration =  moment.duration(time,'seconds');
                        return  duration.hours() + 'h:' + duration.minutes() + 'm:' + duration.seconds() + 's';
                    }
                    else if (time == null) {
                        return '';
                    }
                    else {
                        //Time is a Date object
                        return moment(time).zone('+0000').format('DD-MM-YYYY HH:mm:ss');
                    }
                };

                /******************************************************************
                 * AUXILIAr FUNCTIONS & VARIABLES
                 *****************************************************************/
                function isNumber(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                };

                function cartesiansToGeodesics(point) {
                    //point[0] = x, point[1] = y
                    var geodesics = mercator.inverse([point[0]*1000,point[1]*1000]);
                    return [
                        geodesics[1],
                        geodesics[0]
                    ];
                }

                function coordIndentity(point) {
                    return point;
                }

                //Check if a waypoint has changed in the received game status to avoid continuos updates
                // TODO: Revisar esta mierda xD
                function checkWaypointChanges(waypoints1, waypoints2) {

                    if (!waypoints1 || !waypoints2) {
                        return true;
                    }

                    if (waypoints1.length != waypoints2.length) {
                        return true;
                    }
                    else {
                        for (var i = 0; i < waypoints1.length; i++) {
                            if (waypoints1[i].x != waypoints2[i].x ||
                                waypoints1[i].y != waypoints2[i].y)

                                return true;
                        }
                    }

                    return false;
                };
            });

        return controlPanelModule;
    });