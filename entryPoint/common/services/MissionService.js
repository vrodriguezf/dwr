/**
 * Created by victor on 3/12/14.
 */
define(['../module','../namespace'], function (module,namespace) {
    'use strict';

    var name = namespace + '.MissionService';
    var dependencies = ['$resource'];

    var service = function ($resource) {
        return $resource('api/missions/:id',{},{
            query: {method:'GET', params:{}, isArray:true}
        });
    };

    module.factory(name, dependencies.concat(service));
});