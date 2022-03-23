//Require scripts
//load("lib/SnapshotCauses.js");

/*
* Returns a cursor containing all the simulation snapshots of a given simulationId 
    (Join Simulation-SimulationSnapshot)
*/
function getSimulationSnapshots(simulationId,sorted) {
    return db.simulationsnapshots.find({simulation : simulationId}).sort({elapsedSimulationTime: sorted});
}

/*
* Returns a cursor containing all the drone snapshots of a given simulationSnapshotId 
    (Join Simulationsnapshots-DroneSnapshots)
*/
function getDroneSnapshots(simulationSnapshotId) {
    return db.dronesnapshots.find({simulationSnapshot : simulationSnapshotId});
}

function getDroneSnapshot(simulationSnapshotId,droneId) {
    return db.dronesnapshots.findOne({simulationSnapshot : simulationSnapshotId, droneId : droneId});    
}

/*
* Returns a cursor containing the previous simulation snapshots to one given as parameter.
* Only returns a "limit" number oif result. If limit is null, return all of them.
*/
function getPreviousSimulationSnapshots(snapshot,limit) {
    return db.simulationsnapshots
        .find(
            {
                simulation : snapshot.simulation,
                elapsedSimulationTime : {$lte : snapshot.elapsedSimulationTime}
            }
        )
        .sort({elapsedSimulationTime:-1})
        .limit(limit)
}

/*
* Returns a cursor containing the next simulation snapshots to one given as parameter.
* Only returns a "limit" number oif result. If limit is null, return all of them.
*/
function getNextSimulationSnapshots(snapshot,limit) {
    return db.simulationsnapshots
        .find(
            {
                simulation : snapshot.simulation,
                elapsedSimulationTime : {$gte : snapshot.elapsedSimulationTime}
            }
        )
        .sort({elapsedSimulationTime:1})
        .limit(limit)
}

/*
* Get the previous snapshots for an specific drone. (Returns an array) The first elements are the nearest
* snapshots to the snapshot given.
*/
function getPreviousDroneSnapshots(droneSnapshot, limit) {
    //Retrieve all the simulation snapshots previous to the simulation snapshot associated
    // to this droneSnapshot
    var associatedSimulationSnapshot = db.simulationsnapshots.findOne({_id : droneSnapshot.simulationSnapshot})
    var previousSimulationSnapshots = getPreviousSimulationSnapshots(associatedSimulationSnapshot, limit);
    var previousDroneSnapshots = previousSimulationSnapshots.map(function (previousSimulationSnapshot) {
        return db.dronesnapshots.findOne({simulationSnapshot: previousSimulationSnapshot._id, droneId : droneSnapshot.droneId});
    });
    
    return previousDroneSnapshots;
}

/*
* Get the next snapshots for an specific drone. (Returns an array) The first elements are the nearest
* snapshots to the snapshot given.
*/
function getNextDroneSnapshots(droneSnapshot, limit) {
    //Retrieve all the simulation snapshots previous to the simulation snapshot associated
    // to this droneSnapshot
    var associatedSimulationSnapshot = db.simulationsnapshots.findOne({_id : droneSnapshot.simulationSnapshot})
    var nextSimulationSnapshots = getNextSimulationSnapshots(associatedSimulationSnapshot, limit);
    var nextDroneSnapshots = nextSimulationSnapshots.map(function (nextSimulationSnapshot) {
        return db.dronesnapshots.findOne({simulationSnapshot: nextSimulationSnapshot._id, droneId : droneSnapshot.droneId});
    });
    
    return nextDroneSnapshots;
}

/*
* Returns an array of DroneSnapshots representing the evolution of a given drone over a given simulation
*
* TestData
* var simulation = db.simulations.findOne({'importedMissionPlan.id' : 3})
* getDroneEvolution(simulation._id,1)
*/
function getDroneEvolution(simulationId,droneId) {
    return getSimulationSnapshots(simulationId).map(function (ss) {
        return db.dronesnapshots.findOne({simulationSnapshot: ss._id, droneId : droneId})
    })
}

/*
* INPUT : SimulationSnapshot document
* OUTPUT : Null if the input doesn't match to a 'CHANGE_DRONE_PATH' event
*          Otherwise, returns an object containing specific data of that interaction (type, drone affected...)
*
*
*/
function getWaypointInteractionInfo(simulationSnapshot) {
    //Check if the simulation snapshot is really a 'CHANGE_DRONE_PATH' user input
    if (simulationSnapshot.cause.id == 0 && simulationSnapshot.cause.params.inputId == 4) {
        //Get the drone snapshot associated to the simulation snapshot and the droneId of the interaction TODO 
    } 
    else {
        //TODO
        return null;
    }
}

var SimulationModel = {
    getById: function (id,populateLevel) {
        
        var simulation = db.simulations.findOne({_id: id});
        
        var nextPopulationLevel = (populateLevel > 0) ? populateLevel-1 : populateLevel;
    }
}