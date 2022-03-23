define(['../module','../namespace'], function (module,namespace) {
    'use strict';

    var name = namespace + '.ScenarySchedulerService';
    var dependencies = ['$resource'];

    var service = function ($resource) {
        return $resource('api/scenarySchedulers/:ssId',{},{
            query: {method:'GET', params:{}, isArray:true},
            getByMission: {
                url:'api/scenarySchedulers/search/mission/:missionId',
                method: 'GET',
                isArray: true
            }
        });
    }

    module.factory(name, dependencies.concat(service));
});