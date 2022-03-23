/**
 * Created by victor on 18/11/14.
 */
 
// Change working directory
cd('/home/victor/Bitbucket/DroneWatchAndRescue/dataAnalysis/similitudeMetrics');

//Load scripts
load("lib/simulations.js");


function getScenarySchedulerFromSimulation(simulation) {
   return db.ScenaryScheduler.find({_id : simulation.scenaryScheduler.id}).next()    
}

function getIncidentsPlanFromSimulation(simulation) {
    return db.IncidentPlans.find({_id : getScenarySchedulerFromSimulation(simulation).incidentsPlan.$id}).next()
}

function getInteractionsGuide(simulation,join) {
    return SimulationModel.getById(
        getScenarySchedulerFromSimulation(simulation).interactionsGuide.$id
        ,join)
}

/*
*
*/
function getSimulationSnapshotsByCause(simulation,causeId,join) {
    return db.simulationSnapshots.find(
        {
            simulation: simulation._id,
            'cause.id': causeId
        }
    ).map(function (ss) {
        if (join) {
            ss.droneSnapshots = db.droneSnapshots.find({simulationSnapshots:ss._id}).toArray()
        }
        return ss;
    });
};

/**
* Joins a simulation snapshot cursor!!
*/
function joinSimulationSnapshots(ssCursor) {
    return ssCursor.map(function (ss) {
        ss.droneSnapshots = db.droneSnapshots.find(
            {
                simulationSnapshot: ss._id
            }
        ).toArray()
            
        return ss
    });
}

/**
* Get next simulation snapshots (in real time or simulation time)
**/
function getNextSimulationSnapshots(simulationSnapshot,timeThreshold,realTime,join) {
    var results;
    if (realTime) {
        results = db.simulationSnapshots.find(
            {
                elapsedRealTime: { 
                    $gte : simulationSnapshot.elapsedRealTime,
                    $lt: simulationSnapshot.elapsedRealTime+timeThreshold
                }
            }
        )
    }
    else {
        results = db.simulationSnapshots.find(
            {
                elapsedRealTime: { 
                    $gte : simulationSnapshot.elapsedSimulationTime,
                    $lt: simulationSnapshot.elapsedSimulationTime+timeThreshold
                }
            }
        )     
    }
    //join
    if (join) return joinSimulationSnapshots(results)
    else return results
}

function getSimulationSnapshotsAfterAnIncident(simulation,incident,timeThreshold,realTime,join) {
    var startSnapshot = db.simulationSnapshots.find(
         {
             simulation: simulation._id,
             'cause.id' : 2,    //Cause 2: INCIDENT_STARTED
             'cause.params.incidentId' : incident._id
         }
    ).limit(1);
     
    if (!startSnapshot.hasNext()) return [];
    return getNextSimulationSnapshots(startSnapshot.next(),timeThreshold,true,true);  
}

/**
* 
**/
function getInteractionsSimilitude(playerInteractions, guideInteractions) {
   
    var interactionsCountRelation = (guideInteractions.length != 0)
        ?       playerInteractions.length / guideInteractions.length
        :       Infinity
    
    //Get only the relevant ifno of each interaction
    var playerInputIds = playerInteractions.map(function (interaction) {return interaction.cause.params.inputId});
    var guideInputIds = guideInteractions.map(function (interaction) {return interaction.cause.params.inputId});
    
    //Filter the player interactions and get only the ones sharing ID
    var sharedInteractions = playerInputIds.filter(function (inputId) {
        return (guideInputIds.indexOf(inputId) >= 0 )
    });
    
    //Calculate the interaction sequence-similitude
    var interactionSeqSim = 0;
    var correctInteractions = 0;
    playerInteractions.forEach(function (playerInteraction) {
        if (playerInteraction.cause.params.inputId == guideInteractions[correctInteractions].cause.params.inputId) {
            interactionSeqSim += (1/playerInteractions.length)
            correctInteractions++;
        }
    });
    
    return interactionSeqSim;
} 

/**
*
**/
function getGuideSimilitudeMetrics(simulation) {
    var incidentsPlan = getIncidentsPlanFromSimulation(simulation);
    
    //Get complete incident objects
    var playerSimulation = SimulationModel.getById(simulation._id);
    var guideSimulation = getInteractionsGuide(simulation,true);
    
    //Compare only the user interactions
    var playerInteractions = getSimulationSnapshotsByCause(simulation,0,true);
    var trainerInteractions = getSimulationSnapshotsByCause(guideSimulation,0,true);
    
    var similitudes = [];
    incidentsPlan.incidents.forEach(function (incident) {
        print(getSimulationSnapshotsAfterAnIncident(guideSimulation,incident,15000,true,true))
        var guideIncidentInteractions = getSimulationSnapshotsAfterAnIncident(guideSimulation,incident,15000,true,true).filter(
            function (ss) {return ss.cause.id == 0}
        );
        var playerIncidentInteractions = getSimulationSnapshotsAfterAnIncident(playerSimulation,incident,15000,true,true).filter(
            function (ss) {return ss.cause.id == 0}
        );
        
        similitudes.push(
            {
                incident: incident,
                value : getInteractionsSimilitude(playerIncidentInteractions,guideIncidentInteractions)
            }
        );
    });
    
    return similitudes;
}

function getGlobalGuideSimilitude(simulation) {
    var globalSim = 0;
    var metrics = getGuideSimilitudeMetrics(simulation);
    metrics.forEach(function (metric) {
        globalSim += (metric.value / metrics.length);
    });
    
    return globalSim;
}

/**
* CALL THIS FUNCTION TO RETRIEVE THE METRICS OF A SIMULATION INSTANCE
**/
function getMetrics(simulation) {
    
    //Database in use
    //use StudentsData
    
    //Calculate similitude with guide
    var metrics = getGuideSimilitudeMetrics(simulation);
    var global = getGlobalGuideSimilitude(simulation);
    
    return {
        guideSimilitude: {
            incidentReactions: {
                data : metrics,
                mean: global
            }
        }
    }
}
