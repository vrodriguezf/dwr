/*global requirejs*/
'use strict';

var developmentPaths = {
    'angular': '/bower_components/angular/angular',
    'angularTouch': 'vendor/angular-touch/angular-touch.min',
    'angularSocketIO': 'vendor/socket',
    'angularBootstrap': 'vendor/ui-bootstrap-tpls-0.11.0.min',
    'angularSlider': 'vendor/venturocket-angular-slider/build/angular-slider.min',
    'angularScrollDown': 'vendor/angularjs-scroll-glue-Luegg/src/scrollglue',
    'angularSelection': 'vendor/angular-selection-model-master/dist/selection-model.min',
    'moment': 'vendor/moment/min/moment.min',
    'lodash': 'vendor/lodash/dist/lodash.min',
    'Phaser': 'vendor/phaser.min',
    'ClientAPI': 'API/ClientAPI',
    'sphericalMercator': '/node_modules/sphericalmercator/sphericalmercator'
};

var productionPaths = {
    'angular': '/bower_components/angular/angular.min',
    'angularTouch': 'vendor/angular-touch/angular-touch.min',
    'angularSocketIO': 'vendor/socket',
    'angularBootstrap': 'vendor/ui-bootstrap-tpls-0.11.0.min',
    'angularSlider': 'vendor/venturocket-angular-slider/build/angular-slider.min',
    'angularScrollDown': 'vendor/angularjs-scroll-glue-Luegg/src/scrollglue',
    'angularSelection': 'vendor/angular-selection-model-master/dist/selection-model.min',
    'moment': 'vendor/moment/min/moment.min',
    'lodash': 'vendor/lodash/dist/lodash.min',
    'Phaser': 'vendor/phaser.min',
    'ClientAPI': 'API/ClientAPI',
    'sphericalMercator': '/node_modules/sphericalmercator/sphericalmercator'
};

requirejs.config({
    baseUrl: "/simulationGUI/",
    waitSeconds: 3000,
    shim: {
        'angular': {
            exports: 'angular'
        },
        'angularTouch': {
            deps: ['angular'],
            exports: 'angularTouch'
        },
        'angularSocketIO': {
            deps: ['angular'],
            exports: 'angularSocketIO'
        },
        'angularBootstrap': {
            deps: ['angular'],
            exports: 'angularBootstrap'
        },
        'angularSlider': {
            deps: ['angular', 'angularTouch'],
            exports: 'angularSlider'
        },
        'angularScrollDown': {
            deps: ['angular'],
            exports: 'angularScrollDown'
        },
        'angularSelection': {
            deps: ['angular'],
            exports: 'angularSelection'
        },
        'Phaser': {
            exports: 'Phaser'
        },
        'io': {
            exports: 'io'
        },
        'moment': {
            exports: 'moment'
        },
        'lodash': {
            deps: ['angular'],
            exports: 'lodash'
        },
        'sphericalMercator' : {
            exports: 'sphericalMercator'
        }
    },
    paths: productionPaths
});

require(['angular', 'app/utils/generalJSUtils', 'app/loader', 'controlPanel/module', 'controlPanel/namespace'],
    function (angular, generalJSUtils, gameLoader, controlPanel, namespace) {

        //Things to do before bootstrapping the application

        //GLOBAL VARIABLES
        window.baseUrl = '/simulationGUI/';
        window.queryParams = generalJSUtils.parseQueryString();

        angular.element(document).ready(function () {

            angular.bootstrap(document, [namespace]);
            gameLoader.start();
        });
    });