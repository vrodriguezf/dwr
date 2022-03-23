/**
 * Created by victor on 17/11/14.
 */
var MissionModel = baseRequire('/API/models/UAS_MissionInput/Missions').get();

exports.findAll = function (req, res) {
	MissionModel.findAll(function (err,results) {
		if (err) {
			res.status(400);
			res.send(err);
		}
		else {
			res.send(results);
		}
	});
};

exports.getById = function (req,res) {
	MissionModel.getById(req.params['id'],-1,function (err,result) {
		if (err) {
			res.status(400);
			res.send(err);
		}
		else {
			res.send(result);
		}
	});
};