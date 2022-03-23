define(['../module','../namespace'], function (module,namespace) {
     'use strict';

     var name = namespace + '.ScenarySchedulerCtrl';
     var dependencies = ['$scope', '$location',
		 							namespace+'.MissionService',
		 							namespace+'.TestMissionService',
	 								namespace+'.IncidentsPlanService'];

     var controller = function ($scope, $location, Missions, TestMissions, IncidentPlans) {

		 $scope.missions = TestMissions.getTestMissions();
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
					 displayName: 'No flight Zones'
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
			 afterSelectionChange: function() {
				 var objectChanged = $scope.gridOptions.selectedItems[0];

				 if (objectChanged) {
					 //Query for the incidents plan of the selected mission
					 objectChanged.incidentPlans = IncidentPlans.getByMission({missionId:objectChanged._id},
					 function () {
						 $scope.incidentPlans.selected = objectChanged.incidentPlans[0];
					 },
					 null); //Errores?
				 }
			 }
		 };

		 $scope.incidentPlans = {};
		 $scope.newScenaryScheduler = {};

		 $scope.setInteractionsGuide = function () {
			 console.log($scope.incidentPlans.selected._id);
			 window.open('http://' +
				 $location.host() +
				 ':' + $location.port() +
				 '/missionSimulator' +
				 '?' +
				 'missionPlanId=' + $scope.gridOptions.selectedItems[0]._id + '&' +
				 'scenarySchedulerId=' + $scope.newScenaryScheduler._id + '&' +
				 'incidentsPlanId' + '=' + $scope.incidentPlans.selected._id + '&' +
				 'test=' + ($scope.gridOptions.selectedItems[0].test ? 1 : 0) + '&' +
				 'mode=setInteractionsGuide'
			 );
		 };

     };

     module.controller(name, dependencies.concat(controller));

});