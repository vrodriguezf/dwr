define(['angular',
		'./namespace',
		'angularResource'
	],
	function (angular,namespace) {
		'use strict';

		var module =  angular.module(namespace,
			[
				'ngResource'
			])
		.config(function () {
			console.log('Configuring ' + namespace + ' module...');

		})

		.run(function () {
			console.log('Running ' + namespace + ' module...');			
		});

		return module;
});