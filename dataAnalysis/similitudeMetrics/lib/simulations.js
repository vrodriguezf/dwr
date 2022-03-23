/**
 * Created by victor on 18/11/14.
 */

/**
 * NOTE : WE SUPPOSE THAT DB IS DEFINED, AND ITS VALUE CONTAINS A COLLECTION NAMED 'simulations'
 **/

var SimulationModel = {
    getById: function (id, join) {
        var simulation = db.simulations.findOne({_id : id});
        if (join && simulation!=null) {
            simulation.snapshots = db.simulationSnapshots
                                    .find({simulation : simulation._id})
                                    .map(function (ss) {
                                        ss.droneSnapshots = db
                                                            .droneSnapshots
                                                            .find({simulationSnapshot: ss._id}).toArray()
                                        return ss;   
                                    })
        }
        
        return simulation;
    }
};