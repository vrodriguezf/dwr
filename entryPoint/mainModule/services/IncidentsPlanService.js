/**
 * Created by victor on 18/11/14.
 */
define(['../module','../namespace'], function (module,namespace) {
    'use strict';

    var name = namespace + '.IncidentsPlanService';
    var dependencies = ['$resource'];

    var service = function ($resource) {
        return $resource('api/incidentPlans/:incidentPlanId',{},{
            query: {method:'GET', params:{}, isArray:true},
            getByMission: {
                url:'api/incidentPlans/search/mission/:missionId',
                method: 'GET',
                isArray: true
            },
            save: {
                method: 'POST',
                isArray : false
            }
        });
    };

    module.factory(name, dependencies.concat(service));
});