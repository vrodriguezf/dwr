########################################
#### METRICS
########################################

##
# AGILITY
#
# Computes the agility of a simulation as an average of the simulation speed for all the interactions
# performed during the simulation
#
# Input : SimulationID: Identifies the simulation 
# Output: A number between [0,1] representing the simulation agility
##
metric.agility = function (simulationID) 
{
  # Filter the snapshots dataframe to get only the interactions
  simInteractions <- dataHelper.getSimulationInteractions(simulationID)
  
  #Compute the average of the interaction speed (normalized with the maximum speed)
  result <- mean(simInteractions$simulationSpeed/constant.MAX_SIMULATION_SPEED)
  
  return(result)
}


##
# CONSUMPTION
#
# Computes the resource consumption of a simulation, taking account of the fuel consumption and the UAVs used
# during the simulation time
#
# Input : SimulationID: Identifies the simulation 
# Output: A number between [0,1] representing the simulation resource consumption
##
metric.consumption = function (simulationID) {
  # 1. Amount of fuel at the start of the mission
  dronesInitFuel <- dataHelper.getFirstDroneSnapshots(simulationID) %>%
                              group_by(droneId) %>%
                              summarise(initFuel = max(remainingFuel))
  
  missionEnvironment <- missionHelper.getSimulationEnvironment(simulationID)
  missionRefuelingStations <- missionEnvironment$refueling_stations
  missionUAVS <- missionEnvironment$uavs
  
  initFuel <- sum(dronesInitFuel$initFuel) + sum(missionRefuelingStations$fuel_capacity)
  
  # 2. Amount of fuel at the end of the missions
  
  # 2.1. Amount of fuel at the end of the simulation on the drones (still alive)
  dronesFinalFuel <- dataHelper.getLastDroneSnapshots(simulationID) %>%
                                group_by(droneId) %>%
                                summarise(finalFuel = min(remainingFuel))
  
  
  # 2.2 Amount of fuel consumed in refueling actions (any refueling station)
  #NOTE: We are supposing that infor each refueling, the drone gets its max fuel value again (Our dataset
  #doesn't give us the exact amount of fuel charged')
  refuelings <- students.droneSnapshots %>%
                        filter(simulation == simulationID,
                               cause.id == SnapshotCauses$ACTION_STARTED,
                               cause.params.id == 'refueling',
                               status == 2) %>%
                        merge(
                            missionUAVS,
                            by.x="droneId",
                            by.y="uavs_id"
                          ) %>%
                        select(droneId,droneSnapshotID,remainingFuel,max_fuel)
  
  endFuel <- sum(dronesFinalFuel$finalFuel) + sum(missionRefuelingStations$fuel_capacity) - sum(refuelings$max_fuel-refuelings$remainingFuel)
  
  return(endFuel/initFuel)
}

##
# SCORE
#
# Computes the score obtained for a simulation, in terms of the number of targets detected and the number of
# survining drones.
#
# Input : SimulationID: Identifies the simulation 
# Output: A number between [0,1] representing the simulation score
##
metric.score = function (simulationID)
{
  targetsDetected <- students.simulationSnapshots %>% filter(simulation == simulationID,
                                                             cause.id==SnapshotCauses$TARGET_DETECTED)
  dronesDestroyed <- students.simulationSnapshots %>% filter(simulation == simulationID,
                                                             cause.id == SnapshotCauses$DRONE_DESTROYED)
  
  firstDroneSnapshots <- dataHelper.getFirstDroneSnapshots(simulationID)
  
  #Get the mission Info necessary from the first drone snapshots
  missionTargets <- missionHelper.getTargetsDefinitionById(firstDroneSnapshots[1,]$importedTargetsDefinition.id)$targets
  
  #Calculate UAVs that have returned to base at the end of the simulation
  airportPositions <- missionHelper.getSimulationEnvironment(simulationID)$airports$position
  lastDronePositions <- dataHelper.getLastDroneSnapshots(simulationID) %>%
                        group_by(droneId) %>%
                        summarise(
                            position.x=first(position.x),
                            position.y=first(position.y)
                          )
  baseSnapshots <- merge(airportPositions,lastDronePositions,
                         by.x=c("x","y"),
                         by.y=c("position.x","position.y")
                         )
        
  return(
      (
        (nrow(targetsDetected)/nrow(missionTargets)) + 
          (1- nrow(dronesDestroyed)/nrow(firstDroneSnapshots)) + 
          (nrow(baseSnapshots)/nrow(firstDroneSnapshots))
        )/
        3
    )
}

##
# ATTENTION LEVEL
#
# Computes the attention of a player into a simulation, evaluating the number of interactions
# he has performed
#
# Input : SimulationID: Identifies the simulation 
# Output: A number between [0,1] representing the simulation attention level
##
metric.attention = function (simulationID)
{ 
  return( 
      1 - 1/(sqrt(nrow(dataHelper.getSimulationInteractions(simulationID))+1))  
    )
}

##
# PRECISION
#
# Computes the attention of a player into a simulation, evaluating the number of interactions
# he has performed for each incident
#
# Input : SimulationID: Identifies the simulation 
# Output: A number between [0,1] representing the simulation precision
##
metric.precision = function (simulationID) 
{
  
  ##
  # INCIDENT PRECISION
  ##
  #Get the snapshots of the triggered incidents during this simulation
  incidentsTriggered <- dataHelper.getSimulationIncidentSnapshots(simulationID) %>%
    rename(incidentID = cause.params.incidentType,
           realTriggerInstant = elapsedRealTime,
           simulationTriggerInstant = elapsedSimulationTime) %>% ## TODO
    select(incidentID,realTriggerInstant,simulationTriggerInstant)
  
  
  #Extreme case - No incidents triggered during the simulation (Omit this metric - Not available)
  if (nrow(incidentsTriggered) == 0) {
    return(NA)
  }
  
  waypointInteractions <- dataHelper.getWaypointInteractions(simulationID)
  
  # Create a list containing, for each incident, a dataframe containing all the waypoint interactions made to
  # overcome that incident
  waypointInteractionsByIncident <- dlply(incidentsTriggered,
                                     .(incidentID),
                                     function (dfRow) 
                                       (waypointInteractions %>% 
                                          filter(elapsedRealTime >= dfRow$realTriggerInstant,
                                                 elapsedRealTime <= dfRow$realTriggerInstant + constant.INCIDENT_ACTION_THRESHOLD)
                                        )
                                     )
  
  #Calculate theiuncident precision counting the interactions for each incident
  incidentPrecision <- Reduce(sum,
                              llply(waypointInteractionsByIncident, 
                                    function (e) (
                                        1 - (1/(nrow(e) + 1))
                                      )
                                    )
                              )/
                      length(waypointInteractionsByIncident)
  
  
  ##
  # MONITORING PRECISION
  ##
  
  #Calculate the monitoring precision penalizing the waypoint interactions outside incidents time
  monitoringPrecision = 1/(1 + nrow(helper.dataFrameDiff(waypointInteractions,
                                                         unique(do.call(rbind, waypointInteractionsByIncident)))))
  
  #The final precision will be an average between the two types of precision (incident, monitoring)
#   return(
#     (incidentPrecision + monitoringPrecision)/2
#     )

  return(monitoringPrecision)
}

##
# AGRESSIVENESS
#
# Computes the agressiveness of a player, based on the type of waypoint movements the have performed
#
# Input : SimulationID: Identifies the simulation 
# Output: A number between [0,1] representing the simulation precision
##
metric.agressiveness = function (simulationID) 
{
  #PO
}