/**
 * Created by victor on 3/12/14.
 */
define(['../module','../namespace'], function (module,namespace) {
    'use strict';

    var name = namespace + '.MissionPlanService';
    var dependencies = ['$resource'];

    var service = function ($resource) {
        return $resource('api/missionPlans/:missionPlanId',{},{
            query: {method:'GET', params:{}, isArray:true},
            getByMission: {
                url: 'api/missionPlans/search/mission/:missionId',
                method: 'GET',
                isArray : true
            }
        });
    };

    module.factory(name, dependencies.concat(service));
});