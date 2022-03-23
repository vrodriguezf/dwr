define(['angular',
		'angularBootstrap',
		'angularSlider',
		'angularUIRouter',
		'./namespace',

		'ngGrid',
		'angularResource'
	],
	function (angular, angularBootstrap, angularSlider, angularUIRouter,namespace) {
		'use strict';

		var mainModule =  angular.module(namespace, 
			[
				'ui.bootstrap',
				'vr.directives.slider',
				'ngResource',
				'ui.router',
				'ngGrid'
			])
		.config(function ($stateProvider, $urlRouterProvider) {
			console.log('Configuring ' + namespace + ' module...');

			$urlRouterProvider.otherwise('home');

			//Set up the states
			$stateProvider
				.state('home', {
					url: '/home',
					templateUrl: 'mainModule/views/home.html',
					controller : namespace + '.HomeCtrl'
				})
				.state('missionDesigner', {
					url: '/missionDesigner',
					templateUrl: 'mainModule/views/missionDesigner.html',
					controller : namespace + '.MissionDesignerCtrl'
				})
				.state('scenaryScheduler', {
					url: '/scenaryScheduler',
					templateUrl: 'mainModule/views/scenaryScheduler.html',
					controller : namespace + '.ScenarySchedulerCtrl'
				})
				.state('addIncidentsPlan', {
					url: '/scenaryScheduler/addIncidentsPlan?missionId&test',
					templateUrl: 'mainModule/views/scenaryScheduler/addIncidentsPlan.html',
					controller: namespace + '.AddIncidentsPlanCtrl'
				})
				.state('missionSimulator', {
					url: '/missionSimulator',
					templateUrl: 'mainModule/views/missionSimulator.html',
					controller : namespace + '.MissionSimulatorCtrl'
				});

		})

		.run(function () {
			console.log('Running ' + namespace + ' module...');			
		});

		return mainModule;
});