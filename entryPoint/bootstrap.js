/**
 * bootstraps angular onto the window.document node
 * NOTE: the ng-app attribute should not be on the index.html when using ng.bootstrap
 */
define([
    'require',
    'angular',
    './namespace',
    './app'
], function (require, ng, namespace) {
    'use strict';

    /*
     * place operations that need to initialize prior to app start here
     * using the `run` function on the top-level module
     */
     console.log('Ejecutando bootstrap de entry point!!');

    require(['domReady!'], function (document) {
        ng.bootstrap(document, [namespace]);
    });
});