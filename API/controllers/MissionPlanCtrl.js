/**
 * Created by victor on 11/11/14.
 */
var mongo = require('mongoskin');
var defaultConf = baseRequire('conf/dbConf');

module.exports = (function(){

    var db = mongo.db('mongodb://' +    defaultConf.UAS_MissionPlan.host + ':' +
        defaultConf.UAS_MissionPlan.port + '/' +
        defaultConf.UAS_MissionPlan.db,
        {native_parser : true});
    missionPlanDB.bind('Plans');

    var missionCtrl = {
        findAllPlans : function (req,res) {
        },
        getById : function (req,res) {

        },
        close : function () {
            db.close();
        }
    }

    return missionCtrl;
}());