var express = require('express');

/**
 * Controllers
 * @type {exports}
 */
var IncidentsPlansCtrl = baseRequire('/API/controllers/DWR/IncidentsPlansCtrl');
var MissionCtrl = require('./controllers/MissionCtrl');
var MissionPlanCtrl = baseRequire('/API/controllers/UAS_MissionPlan/MissionPlanCtrl');
var ScenarySchedulerCtrl = baseRequire('/API/controllers/DWR/ScenarySchedulerCtrl');

//api routes
var apiRoutes = express.Router();

/**
 * Missions
 */
apiRoutes.route('/missions')
	.get(MissionCtrl.findAll);


apiRoutes.route('/missions/:id')
	.get(MissionCtrl.getById);

apiRoutes.route('/scenarySchedulers/search/mission/:missionId')
	.get(ScenarySchedulerCtrl.getByMission);

/**
 * Mission plans
 */
apiRoutes.route('/missionPlans/search/mission/:missionId')
	.get(MissionPlanCtrl.getByMission);

/**
 * Incidents Plans
 */
apiRoutes.route('/incidentPlans')
	.get(IncidentsPlansCtrl.findAllIncidentsPlans)
	.post(IncidentsPlansCtrl.addIncidentsPlan);

apiRoutes.route('/incidentPlans/search/mission/:missionId')
	.get(IncidentsPlansCtrl.getByMission);

module.exports = apiRoutes;