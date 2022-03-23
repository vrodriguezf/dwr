/**
 * Created by victor on 17/11/14.
 */
define(['../module', '../namespace'], function (module, namespace) {
    'use strict';

    var name = namespace + '.TestMissionService';
    var dependencies = [];

    var service = function () {

        var testMissions = [
            {
                _id: 'testMission01',
                test: true,
                description: 'This test mission features one UAV performing a Surveillance task. It starts with a pre-loaded plan and' +
                ' presents several incidents during the simulation',
                plans: [
                    {
                        _id: 'testMission01'
                    }
                ],
                ss: [
                    {
                        id: 'ss01_testMission01'
                    }
                ],
                incidentPlans: [
                    {
                        id : 'incidentsPlan01_testMission01'
                    }
                ],
                duration : 75600,
                scenary: {
                    uavs: [
                        {
                            UAVs_id : 1
                        }
                    ],
                    no_flight_zones: [
                        {
                            NoFlightZones_id: 1
                        },
                        {
                            NoFlightZones_id: 2
                        }
                    ]
                },
                objectives : [
                    {
                        objectives_id: 1
                    }
                ]
            },
            {
                _id: 'testMission02',
                test: true,
                description: 'This test mission features one UAV performing a Surveillance task. It starts with a pre-loaded plan and' +
                ' presents several incidents during the simulation',
                plans: [
                    {
                        _id: 'testMission02'
                    }
                ],
                ss: [
                    {
                        id: 'ss01_testMission02'
                    }
                ],
                incidentPlans: [
                    {
                        id : 'incidentsPlan01_testMission02'
                    }
                ],
                duration : 75600,
                scenary: {
                    uavs: [
                        {
                            UAVs_id : 1
                        }
                    ],
                    no_flight_zones: [
                        {
                            NoFlightZones_id: 1
                        }
                    ]
                },
                objectives : [
                    {
                        objectives_id: 1
                    }
                ]
            },
            {
                _id: 'testMission03',
                test: true,
                description: 'This test mission features three different UAVs ' +
                'performing Surveillance tasks to detect multiple targets in multiple areas. Each drone starts with a preloaded flight-plan. ' +
                'The mission presents several incidents during the simulation, affecting both the environment and the drones involved in it.',
                plans: [
                    {
                        _id: 'testMission03'
                    }
                ],
                ss: [
                    {
                        id: 'ss01_testMission03'
                    }
                ],
                incidentPlans: [
                    {
                        id : 'incidentsPlan01_testMission03'
                    }
                ],
                scenary: {
                    uavs: [
                        {
                            UAVs_id : 1
                        },
                        {
                            UAVs_id : 2
                        },
                        {
                            UAVs_id : 3
                        }
                    ],
                    no_flight_zones: [
                        {
                            NoFlightZones_id: 1
                        },
                        {
                            NoFlightZones_id: 2
                        },
                        {
                            NoFlightZones_id: 3
                        }
                    ]
                },
                objectives : [
                    {
                        objectives_id: 1
                    },
                    {
                        objectives_id: 2
                    },
                    {
                        objectives_id: 3
                    },
                    {
                        objectives_id: 4
                    }
                ]
            },
            {
                _id: 'testMission04',
                test: true,
                description: 'This test mission features three different UAVs ' +
                'performing Surveillance tasks to detect multiple targets in multiple areas. THERE IS NO PRE-LOADED PLANS, THE OPERATOR MUST ASSIGN MANUALLY' +
                'A PATH TO EACH DRONE. ' +
                'The mission presents several incidents during the simulation, affecting both the environment and the drones involved in it.',
                plans: [
                    {
                        _id: 'testMission04'
                    }
                ],
                ss: [
                    {
                        id: 'ss01_testMission04'
                    }
                ],
                incidentPlans: [
                    {
                        id : 'incidentsPlan01_testMission04'
                    }
                ],
                scenary: {
                    uavs: [
                        {
                            UAVs_id : 1
                        },
                        {
                            UAVs_id : 2
                        },
                        {
                            UAVs_id : 3
                        }
                    ],
                    no_flight_zones: [
                        {
                            NoFlightZones_id: 1
                        },
                        {
                            NoFlightZones_id: 2
                        },
                        {
                            NoFlightZones_id: 3
                        }
                    ]
                },
                objectives : [
                    {
                        objectives_id: 1
                    },
                    {
                        objectives_id: 2
                    },
                    {
                        objectives_id: 3
                    },
                    {
                        objectives_id: 4
                    }
                ]
            }
        ];

        var realMissions = [
            {
                _id: 'mission01',
                targets: 0,
                UAVs: 3,
                NoFlightZones: 2,
                Airports: 0,
                test: false,
                description: 'REAL MISSION!',
                plans: [
                    {
                        _id: 'mission01_plan01'
                    }
                ],
                ss: [
                    {
                        id: 'ss01_mission01'
                    }
                ],
                incidentPlans: [
                    {
                        id : 'incidentsPlan01_mission01'
                    }
                ]
            }
        ];

        return {
            getAllMissions: function () {
                return testMissions.concat(realMissions);
            },
            getTestMissions : function () {
                return testMissions;
            },
            getRealMissions: function () {
                return realMissions;
            }
        }
    }

    module.factory(name, dependencies.concat(service));
});