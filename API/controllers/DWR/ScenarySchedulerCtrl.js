/**
 * Created by victor on 17/11/14.
 */
var ScenarySchedulerModel = baseRequire('/API/models/DWR/ScenaryScheduler').get();

exports.getByMission = function (req, res) {
    ScenarySchedulerModel.getByMission(req.params['missionId'], function (err, result) {
        if (err) {
            console.log('ERRORRRR');
        }
        console.log(result);
        res.send(result);
    });
};