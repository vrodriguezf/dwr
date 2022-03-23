/**
 * Created by victor on 3/12/14.
 */
define(['../module', '../namespace', '../../common/namespace', 'lodash'], function (module, namespace, namespaceCommon, _) {
    'use strict';

    var name = namespace + '.MissionInformationCtrl';
    var dependencies = ['$scope',
        namespaceCommon + '.MissionService',
        namespaceCommon + '.MissionPlanService'];

    var controller = function ($scope, MissionService, MissionPlanService) {
        $scope.missions = MissionService.query(
            function (data) {
                console.log('Mission data retrieved successfully');
            },
            function (data) {
                console.log(data.err);
            }
        );

        $scope.missionPlans = [];

        // When the user selects a mission, it is retrieved again from server with all the information
        $scope.detailedMission = {};
        $scope.schedulingData = {};

        $scope.onMissionSelection = function (item, model) {
            $scope.detailedMission = MissionService.get({id: item._id},
                //Success
                function (data) {
                    //Updates the variable that holds the scheduling table definitions
                    $scope.schedulingGrids = _.map(data.objectives, function (objective,index) {
                        return {
                            data: 'detailedMission.objectives[' + index + '].info.tasks',
                            columnDefs: objectiveTasksColumnDefs
                        };
                    });

                    //Updates the scheduling data
                    $scope.schedulingData = data.objectives;
                },
                //Error
                function (err) {
                    console.log(err);
                }
            );

            //Retrieve the mission plans associated to that mission
            $scope.missionPlans= MissionPlanService.getByMission({missionId : item._id},
                function (missionPlans) {
                },
                function (err) {
                    console.log(err);
                }
            );
        };

        $scope.onPlanSelection = function (item,model) {

            //Add the needed information form the detailed mission objectives to the plan objectives
            _.forEach(item.objectives, function (objective) {
                _.assign(objective,{
                    name : _.find($scope.detailedMission.objectives,{objectives_id : objective.objectives_id}).name}
                );

                _.forEach(objective.tasks, function (objectiveTask) {
                    _.assign(objectiveTask,
                        {
                            assignedUAV : _.find($scope.detailedMission.scenary.uavs, {UAVs_id: objectiveTask.UAVs_id})
                        }
                    )
                });
            });

            //Fill the plans table with the plan tasks
            $scope.schedulingGrids = _.map(item.objectives, function (objective,index) {
                return {
                    data : 'missionPlans.selected.objectives[' + index +'].tasks',
                    columnDefs : objectiveTasksColumnDefs
                }
            });
            $scope.riskGrid = {
                data : 'missionPlans.selected.risks.uavs',
                columnDefs: [
                    {
                        field: 'UAVs_id',
                        displayName: 'UAV ID'
                    },
                    {
                        field: 'remainingFuel',
                        displayName: 'Remaining Fuel'
                    }
                ]
            };
            $scope.schedulingData = item.objectives;
        };

        $scope.objectivesGrid = {
            data: 'missions.selected.objectives',
            columnDefs: [
                {
                    field: 'name',
                    displayName: 'Name'
                },
                {
                    field: 'ObjectiveTypes_id',
                    displayName: 'Type'
                },
                {
                    field: 'start_time',
                    displayName: 'Start Time',
                    cellTemplate: '<div>{{formatDate(row.entity[col.field])}}</div>'
                },
                {
                    field: 'end_time',
                    displayName: 'End Time',
                    cellTemplate: '<div>{{formatDate(row.entity[col.field])}}</div>'
                },
                {
                    field: 'duration',
                    displayName: 'Duration (hrs)',
                    cellTemplate: '<div ng-if="row.entity[col.field]!=null">' +
                                        '{{row.entity[col.field]}}' +
                                    '</div>' +
                                    '<div ng-if="row.entity[col.field]==null">' +
                                    '{{getObjectiveDuration(row.entity["start_time"],row.entity["end_time"])}}' +
                                    '</div>'
                },
                {
                    field: 'zone.zone_id',
                    displayName: 'Zone'
                }
            ]
        };

        $scope.schedulingGrids = [];

        $scope.getObjectiveDuration = function (start_time, end_time) {
            if (isNumber(start_time)) {
                return end_time - start_time;
            }
            else {
                var endTimeMoment = moment(end_time,moment.ISO_8601);
                var startTimeMoment = moment(start_time,moment.ISO_8601);
                var diff = endTimeMoment.diff(startTimeMoment);
                return Math.round(diff/3600.0)/1000;
            }
        };

        $scope.formatDate = function (date) {
            if (isNumber(date)) {
                return date;
            }
            else if (date == null) {
                return '';
            }
            else {
                return moment(date).zone('+0000').format('DD-MM-YYYY HH:mm:ss');
            }
        };

        /**
         * Auxiliar functions and variables
         */
        function isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        var objectiveTasksColumnDefs = [
            {
                field: 'name',
                displayName: 'Name'
            },
            {
                field: 'TaskTypes_id',
                displayName: 'Task type'
            },
            {
                field: 'assignedUAV',
                displayName: 'Assigned UAV',
                cellTemplate: '<div class="">' +
                                    '<div ng-if="row.entity[col.field]!=null">' +
                                        '{{row.entity[col.field].name}} ({{row.entity[col.field].UAVs_id}})' +
                                    '</div>' +
                                '</div>'
            },
            {
                field: 'start_time',
                displayName: 'Start time',
                cellTemplate: '<div>{{formatDate(row.entity[col.field])}}</div>'
            },
            {
                field: 'end_time',
                displayName: 'End time',
                cellTemplate: '<div>{{formatDate(row.entity[col.field])}}</div>'
            }
        ];


    };


    module.controller(name, dependencies.concat(controller));
});