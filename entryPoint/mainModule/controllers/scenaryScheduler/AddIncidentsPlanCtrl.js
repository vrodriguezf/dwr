/**
 * Created by victor on 1/12/14.
 */
define(['../../module','../../namespace','lodash','moment'], function (module,namespace,_,moment) {
    'use strict';

    var name = namespace + '.AddIncidentsPlanCtrl';
    var dependencies = ['$scope',
                        '$state',
                        '$stateParams',
                        '$modal',
                        namespace+'.MissionService',
                        namespace+'.TestMissionService',
                        namespace+'.IncidentsPlanService',
                        'UtilsService'];

    var controller = function ($scope,$state, $stateParams,$modal,MissionService,TestMissionService,IncidentsPlan, UtilsService) {

        $scope.test = ($stateParams.test && $stateParams.test == 'true')
            ?   true
            :   false;

        $scope.mission = ($stateParams.test == 'true')
            ? _.find(TestMissionService.getTestMissions(),{_id: $stateParams.missionId})
            :   'adadsad';

        $scope.incidentsPlan = {
            missionId : $scope.mission._id,
            test: $scope.test,
            incidents : [
            ]
        };

        $scope.mission.duration = getMissionDuration($scope.mission);
        $scope.translateTime = function (time) {return UtilsService.translateSimulationTime(time)};

        $scope.incidentsScheduleGridOptions = {
            data : 'incidentsPlan.incidents',
            columnDefs : [
                {
                    field: '_id',
                    displayName: 'ID'
                },
                {
                    field: 'startTime',
                    displayName: 'Start time',
                    cellTemplate : '<div class="">{{translateTime(row.entity[col.field])}}</div>'
                },
                {
                    field: 'endTime',
                    displayName: 'End time',
                    cellTemplate : '<div class="">{{(row.entity[col.field]) ? translateTime(row.entity[col.field]) : null}}</div>'
                },
                {
                    field: 'type',
                    displayName: 'Type'
                },
                {
                    field: 'level',
                    displayName: 'Level'
                },
                {
                    field: 'remove',
                    displayName: 'Remove',
                    cellTemplate: '<button class="btn" ng-click="removeRow($index)"><span class="glyphicon glyphicon-trash"> Remove</span></button>'
                }
            ]
        };

        $scope.removeRow = function() {
            var index = this.row.rowIndex;
            $scope.incidentsScheduleGridOptions.selectItem(index, false);
            $scope.incidentsPlan.incidents.splice(index, 1);
        };

        /**
         * Modal dialog to add incidents
         */
        $scope.addNewIncident = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'mainModule/views/scenaryScheduler/incidentModalDialogContent.html',
                controller: 'IncidentsModalInstanceCtrl',
                size: size,
                windowClass: 'Css-Center-Modal',
                resolve: {
                    mission: function () {
                        return $scope.mission;
                    },
                    test: function() {
                        return $scope.test;
                    }
                }
            });

            modalInstance.result.then(function (newIncident) {
                console.log(newIncident);
                $scope.incidentsPlan.incidents.push(newIncident);
            }, function () {
                console.log('Incident Modal dialog dismissed');
            });
        };

        /**
         * Send the new incidents plan to the server
         */
        $scope.submitNewIncidentsPlan = function () {
            var newIncidentsPlan = new IncidentsPlan($scope.incidentsPlan);
            newIncidentsPlan.$save(
                function (data) {
                    //Detect errors
                    if (data.code) {
                        $scope.incidentsPlanErrorMessage = data;
                    } else {
                        //Result ok!
                        $state.go('scenaryScheduler')
                    }
                },
                function (data) {
                    $scope.incidentsPlanErrorMessage = 'ERROR: [' + data.data.err + ']';
                }
            );
        };

        /**
         * Auxiliar functions
         */
        function getMissionDuration(mission) {
            return mission.duration || 10000; //seconds
        };

    };

    module.controller(name, dependencies.concat(controller));

    /**
     * Modal dialog controller
     */
    module.controller('IncidentsModalInstanceCtrl',['UtilsService','$scope','$modalInstance','mission','test',
        function (UtilsService,$scope,$modalInstance,mission,test) {

        $scope.incidentTypes = [
            'DangerArea',
            'PayloadIncident'
        ];

        $scope.incidentLevels = [
            'CAUTION',
            'WARNING',
            'DANGER'
        ];

        $scope.mission = mission;
        $scope.test = test;
        $scope.hasEndTime = false;
        $scope.incidentEndTime = null;

        $scope.newIncident = {
            test: test,
            level: 'CAUTION'
        };

        $scope.uavAffected = $scope.mission.scenary.uavs[0];
        $scope.areaPoints = [
            [0,0],
            [0,0],
            [0,0]
        ];

        /**
         * A translation function to apply to most of the view values.
         * @param time
         * @returns {*} String
         */
        $scope.translateIncidentTime = function (time) {
            return UtilsService.translateSimulationTime(time);
        };

        $scope.addAreaPoint = function () {
            $scope.areaPoints.push([0,0]);
        };

        $scope.isNewIncidentOk = function () {
            var i = $scope.newIncident;
            return (i._id != null
                    && i._id!=''
                    && i.type != null
                    && i.level!=null
                    && i.startTime!=null
                    && ((!$scope.hasEndTime)|| i.startTime < ($scope.incidentEndTime)))
        };

        /**
         * Submit the new incident
         */
        $scope.ok = function () {
            if ($scope.newIncident.type == 'DangerArea') {
                $scope.newIncident.params = {
                    areaPoints : $scope.areaPoints
                };
            }
            else if ($scope.newIncident.type == 'PayloadIncident') {
                $scope.newIncident.params = {
                    droneId : $scope.uavAffected.UAVs_id
                };
            }
            //End Time
            if ($scope.hasEndTime) $scope.newIncident.endTime = $scope.incidentEndTime;

            //Return the result to the parent controller
            $modalInstance.close($scope.newIncident);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
});