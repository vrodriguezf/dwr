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

		var missionInformation =  angular.module(namespace,
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
				.state('missionInformation', {
					url: '/missionInformation',
					templateUrl: 'missionInformation/views/missionInformation.html',
					controller : namespace + '.MissionInformationCtrl'
				});

		})

		.run(function () {
			console.log('Running ' + namespace + ' module...');			
		});

		return missionInformation;
});