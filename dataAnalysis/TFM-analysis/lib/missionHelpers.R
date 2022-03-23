########################################
## Mission helpers
########################################

missionHelper.getEnvironmentById = function (environmentID) {
  return(
    missions$environment[[match(environmentID,llply(missions$environment, function (e) e$id))]]
  )
}

missionHelper.getSimulationEnvironment = function (simulationID) {
  return(
      missionHelper.getEnvironmentById(
        (dataHelper.getFirstSimulationSnapshot(simulationID))$importedEnvironment.id[[1]]
      )
    )
}

missionHelper.getTargetsDefinitionById = function (targetsDefinitionId) {
  return(
    missions$targets[[match(targetsDefinitionId,llply(missions$targets, function (t) t$id))]]
  )
}

