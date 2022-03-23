db.dronesnapshots.aggregate([
    {
        $unwind: "$waypoints"
    },
    {
        $project: {
            _id: "$waypoints._id",
            droneSnapshot: "$_id",
            type: "$waypoints.type",
            plannedTime: "$waypoints.plannedTime",
            position: "$waypoints.position"
        }
    },
    {
        $out : "temp"
    }
])