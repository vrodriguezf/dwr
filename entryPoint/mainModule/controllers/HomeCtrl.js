define(['../module','../namespace'], function (module,namespace) {
     'use strict';

     var name = namespace + '.HomeCtrl';
     var dependencies = ['$scope'];

     var controller = function ($scope) {
     	$scope.title = 'Ola k ase';
     }

     module.controller(name, dependencies.concat(controller));
});