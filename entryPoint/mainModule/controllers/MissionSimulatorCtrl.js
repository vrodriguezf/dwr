define(['../module','../namespace', '../../common/namespace'], function (module,namespace, namespaceCommon) {
     'use strict';

     var name = namespace + '.MissionSimulatorCtrl';
     var dependencies = ['$scope','$location',
		 							namespaceCommon + '.MissionService',
		 							namespace+'.TestMissionService',
	 								namespace+'.ScenarySchedulerService',
	 								namespaceCommon + '.MissionPlanService'];

     var controller = function ($scope,$location,Mission,TestMission, ScenarySchedulers, MissionPlanService) {

		 //Query the mission plans
		 $scope.missions = TestMission.getTestMissions();
		 /*
		 $scope.missions = [];
		 Mission.query(
			 function (data) {
				 $scope.missions = TestMission.getTestMissions().concat(data);
				 console.log('Mission data retrieved successfully');
			 },
			 function (data) {
				 console.log(data.err);
			 }
		 );
		 */

		 $scope.plans = [];
		 $scope.scenarySchedulers = [];
		 $scope.name;


     	$scope.gridOptions = { 
     		data : 'missions',
			columnDefs: [
				{
					field: '_id',
					displayName: 'ID'
				},
				{
					field: 'objectives.length',
					displayName: 'Objectives'
				},
				{
					field: 'scenary.uavs.length',
					displayName: 'UAVs'
				},
				{
					field: 'scenary.no_flight_zones.length',
					displayName: 'No Flight Zones',
				},
				{
					field: 'test',
					displayName: 'Test',
					cellTemplate : '<div>{{row.entity[col.field] || false}}</div>'
				}
			],
			showSelectionCheckbox: true, 
     		multiSelect : false,
     		selectedItems: [],
			afterSelectionChange: function(item) {
				//Only selection events
				if (item.selected) {
					var objectChanged = item.entity;

					//Retrieve the scenary schedulers associated to that mission
					objectChanged.ss = ScenarySchedulers.getByMission({missionId : objectChanged._id}, function () {
						$scope.scenarySchedulers.selected = objectChanged.ss[0] || null;
					});

					//Retrieve the mission plans associated to that mission
					if (objectChanged.test == true) {
						$scope.plans = objectChanged.plans;
						$scope.plans.selected = objectChanged.plans[0];
					}
					else {
						$scope.plans= MissionPlanService.getByMission({missionId : objectChanged._id},
							function (missionPlans) {
								console.log('asdas');
								$scope.plans.selected = missionPlans[0] || null;
							},
							function (err) {
								console.log(err);
							}
						);
					}
				}
			}
		};

		 /**
		  * Check if all the data has been introduced and a simulation can be executed
		  */
		 $scope.isInputDataOk = function () {
			 return (
			 	($scope.gridOptions.selectedItems[0] != null) &&
				($scope.plans.selected != null) /*&&
				($scope.name != null && $scope.name!='')*/
			 )
		 };

		 /**
		  * Execute the selected simulation calling DWR-Mission Simulator
		  * The simulator runs as an independant module, so we must create another broser page
		  * @param selectedMissionPlan
		  */
     	$scope.simulateMissionPlan = function (selectedMissionPlan) {
     		window.open('http://' +
     					$location.host() + 
     					':' + $location.port() + 
     					'/missionSimulator' +
						'?' +
     					'missionPlanId=' + $scope.plans.selected._id + '&' +
						(($scope.scenarySchedulers.selected)
							? ('scenarySchedulerId=' + $scope.scenarySchedulers.selected._id + '&')
							: '') +
						'name' + '=' + $scope.name + '&' +
						'test=' + (selectedMissionPlan.test ? 1 : 0)
     					);
     	}
     };

     module.controller(name, dependencies.concat(controller));
});