define([
	'angular',
	'angularUISelect',
	'angularSanitize',

	'./namespace',
	'./common/namespace',
	'./mainModule/namespace',
	'./missionInformation/namespace',

	'./common/module.require',
	'./mainModule/module.require',
	'./missionInformation/module.require'
	],
	function (angular,angularUISelect, angularSanitize, namespace,namespaceCommon, mainModuleNamespace,missionInformationNamespace) {
		'use strict';

		var app = angular.module(namespace, [
				'ui.select',
				'ngSanitize',
				namespaceCommon,
				mainModuleNamespace,
				missionInformationNamespace
			])

		.config(function (uiSelectConfig) {
			console.log('Configuring ' + namespace + ' module...');
			//uiSelectConfig.theme = 'bootstrap';
		})

		.run(function () {
			console.log('Running ' + namespace + ' module...');
		})

		;

		return app;
	});