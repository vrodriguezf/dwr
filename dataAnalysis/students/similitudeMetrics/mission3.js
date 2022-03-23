//Set DataBase to use
use StudentsData

//Change working directory and load dependencies
if (db.hostInfo().system.hostname == 'SMH-PC') {
    cd('/home/victor/Bitbucket/DroneWatchAndRescue/dataAnalysis/students');
    load('../similitudeMetrics/main.js');
}

var missionID = 3;
var ssID = 'ss03_testMission03';

//Update the simulations to include the scenary scheduler that we watn to set as guide
db.simulations.update(
    {
        clientIP : {
            $regex : '150.244.65.*'
        },
        'importedMissionPlan.id' : missionID,
        $where: function () {
            return ((this.createdAt.getMonth() == 10 && this.createdAt.getDate() == 7) || 
                    (this.createdAt.getMonth() == 10 && this.createdAt.getDate() == 5))
        }
    },
    {
        $set : 
        {
            'scenaryScheduler.id' : ssID,
            'scenaryScheduler.test' : true
        }
    },
    {
        multi : true
    }
)
 
//Get the metrics for those simulations
db.simulations.find(
    {
        clientIP : {
            $regex : '150.244.65.*'
        },
        'importedMissionPlan.id' : missionID,
        $where: function () {
            return ((this.createdAt.getMonth() == 10 && this.createdAt.getDate() == 7) || 
                    (this.createdAt.getMonth() == 10 && this.createdAt.getDate() == 5))
        }
    }
).toArray().map(function (simulation) {
    return getMetrics(simulation);
})