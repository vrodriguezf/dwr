library('ProjectTemplate')
load.project()

##
# Get the replanning metrics for each user and plot a webplot for each one showing its evolution
##
userReplanningMetrics <- students.simulations %>%
  group_by(simulationID) %>%
  filter(importedMissionPlan.id != 4, !dataHelper.isOutlier(simulationID)) %>%  
  summarize(
    user = helper.getUserName(clientIP,createdAt),
    agility=metric.agility(simulationID),
    consumption=metric.consumption(simulationID),
    score=metric.score(simulationID),
    attention=metric.attention(simulationID),
    precision=metric.precision(simulationID)      
  ) %>%
  na.omit %>% #Remove NA rows (Simulations with no incidences are not valid)
  filter(user == '05_118')

#  View(userReplanningMetrics)

#Plot the evolution of each user (Users with more than one simulation)
#pdf(file.path('graphs','replanningSkillsEvolution.pdf'))
par(mfcol = c(2, 2),mar = c(1, 1, 2, 1),oma = c(3, 0, 3, 0))

for (i in 1:nrow(userReplanningMetrics)) {
  plotHelper.spider(data=userReplanningMetrics[i,],
                    x=3:7,
                    y=1:1,
                    main=paste('Simulation Nº ', i),
                    cex=1,
                    scale=1,
                    center=FALSE,
                    labels=c("A","C","S","AT","P"),
                    fill=TRUE,
                    overlay=TRUE,
                    connect=TRUE,
                    lwd=3)
}

