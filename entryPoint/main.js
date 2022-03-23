/*global requirejs*/
'use strict';

var developmentPaths = {
  'jQuery' : '/bower_components/jquery/dist/jquery',
  'angular' : '/bower_components/angular/angular',
  'angularBootstrap' : 'bower_components/angular-bootstrap/ui-bootstrap-tpls',
  'angularBootstrapTemplates' : 'bower_components/angular-bootstrap/ui-bootstrap-tpls',
  'angularResource' : '/bower_components/angular-resource/angular-resource',
  'angularSanitize' : '/bower_components/angular-sanitize/angular-sanitize',
  'angularUIRouter' : '/bower_components/angular-ui-router/release/angular-ui-router',
  'angularUISelect' : '/bower_components/angular-ui-select/dist/select',
  'angularTouch' : '/bower_components/angular-touch/angular-touch',
  'angularSlider' : '/bower_components/venturocket-angular-slider/build/angular-slider',
  'domReady' : '/bower_components/requirejs-domready/domReady',
  'ngGrid' : '/bower_components/ng-grid/build/ng-grid',
  'lodash' : '/bower_components/lodash/dist/lodash',
  'moment' : '/bower_components/moment/moment'
};

var productionPaths = {
  'jQuery' : '/bower_components/jquery/dist/jquery.min',
  'angular' : '/bower_components/angular/angular.min',
  'angularBootstrap' : 'bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
  'angularBootstrapTemplates' : 'bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
  'angularResource' : '/bower_components/angular-resource/angular-resource.min',
  'angularSanitize' : '/bower_components/angular-sanitize/angular-sanitize.min',
  'angularUIRouter' : '/bower_components/angular-ui-router/release/angular-ui-router.min',
  'angularUISelect' : '/bower_components/angular-ui-select/dist/select.min',
  'angularTouch' : '/bower_components/angular-touch/angular-touch.min',
  'angularSlider' : '/bower_components/venturocket-angular-slider/build/angular-slider.min',
  'domReady' : '/bower_components/requirejs-domready/domReady',
  'ngGrid' : '/bower_components/ng-grid/build/ng-grid.min',
  'lodash' : '/bower_components/lodash/dist/lodash.min',
  'moment' : '/bower_components/moment/min/moment.min'
};

requirejs.config({
  baseUrl:"/",
  paths: productionPaths,
  shim: {
    'jQuery' : {
      exports : 'jQuery'
    },
    'angular' : {
      exports: 'angular'
    },
    'angularResource' : {
      deps: ['angular'],
      exports: 'angularResource'
    },
    'angularSanitize' : {
      deps: ['angular'],
      exports: 'angularSanitize'
    },
    'angularUIRouter' : {
      deps: ['angular'],
      exports : 'angularUIRouter'
    },
    'angularUISelect' : {
      deps: ['angular'],
      exports: 'angularUISelect'
    },
    'angularSlider' : {
      deps: ['angular','angularTouch'],
      exports: 'angularSlider'
    },
    'ngGrid' : {
      deps: ['angular','jQuery'],
      exports: 'ngGrid'
    },
    'lodash' : {
      exports: 'lodash'
    }
  },
  deps: [
      // kick start application... see bootstrap.js
      'bootstrap'
  ]  
});