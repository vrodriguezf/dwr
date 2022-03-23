define(['../module','../namespace','moment'], function (module,namespace,moment) {
    'use strict';

    var name = 'UtilsService';
    var dependencies = [];

    var service = function () {
        return {
            translateSimulationTime : function (time) {

                var duration = moment.duration(time*1000);
                return duration.hours() + 'h' +
                    ':' +
                    duration.minutes() + 'm' +
                    ':' +
                    duration.seconds() + 's';
            }
        }
    };

    module.factory(name, dependencies.concat(service));
});