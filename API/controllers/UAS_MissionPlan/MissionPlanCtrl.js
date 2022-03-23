/**
 * Created by victor on 17/11/14.
 */
var MissionPlanModel = baseRequire('/API/models/UAS_MissionPlan/Plans').get();

exports.findAll = function (req, res) {
};

exports.getById = function (req,res) {
};

exports.getByMission = function (req,res) {
    MissionPlanModel.getByMission(req.params['missionId'],-1,function (err,results) {
        if (err) {
            res.status(400);
            res.send(err);
        }
        else{
            console.log(results);
            res.send(results);
        }
    });
};