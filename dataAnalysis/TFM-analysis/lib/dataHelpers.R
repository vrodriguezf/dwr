#
# Input: SimulationID (String)
# Output: Dataframe containing all the simulation snapshots representing user interactions on that simulation
#
dataHelper.getSimulationInteractions = function (simulationID) 
{
  return(
    students.simulationSnapshots %>%
    filter(simulation == simulationID,
           cause.id == SnapshotCauses$USER_INPUT)
  )
}

###
#
##
dataHelper.getFirstSimulationSnapshot = function (simulationID) 
{
  return(
      students.simulationSnapshots %>%
      filter(simulation == simulationID) %>%
      filter(elapsedRealTime == min(elapsedRealTime))
    )
}

###
#
##
dataHelper.getLastSimulationSnapshot = function (simulationID) 
{
  return(
    students.simulationSnapshots %>%
      filter(simulation == simulationID) %>%
      filter(elapsedRealTime == max(elapsedRealTime))
  )
}

##
#
##
dataHelper.getFirstDroneSnapshots = function (simulationID) {
  return(
    students.droneSnapshots %>%
      filter(simulation == simulationID) %>%
      filter(elapsedRealTime == min(elapsedRealTime))
  )  
}

##
#
##
dataHelper.getLastDroneSnapshots = function (simulationID) {
  return(
    students.droneSnapshots %>%
      filter(simulation == simulationID) %>%
      filter(elapsedRealTime == max(elapsedRealTime))
  )  
}

##
#
##
dataHelper.getSimulationIncidentSnapshots = function (simulationID) {
  return(
      students.simulationSnapshots %>% 
        filter(simulation == simulationID,
               cause.id == SnapshotCauses$INCIDENT_STARTED)
    )
}

##
#
##
dataHelper.getWaypointInteractions = function (simulationID) {
  return(
    students.simulationSnapshots %>%
      filter(simulation == simulationID,
             cause.id == SnapshotCauses$USER_INPUT,
             cause.params.inputId == UserInputs$CHANGE_DRONE_PATH
             )
  )  
}

dataHelper.isOutlier = function (simulationID) {
  return(
      ((dataHelper.getLastSimulationSnapshot(simulationID))$elapsedRealTime[[1]]) < constants.OUTLIER_TIME_THRESHOLD
    )
}