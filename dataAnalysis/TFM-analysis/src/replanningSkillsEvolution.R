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
  arrange(user) 

#Filter and get only the users with more than 2 valid simulations TODO
firstUserReplanningMetrics <- userReplanningMetrics %>%
  group_by(user) %>%
  filter(n()>1) %>%
  summarize(
      agility=first(agility),
      consumption=first(consumption),
      score=first(score),
      attention=first(attention),
      precision=first(precision)
    )

lastUserReplaningMetrics <- userReplanningMetrics %>%
  group_by(user) %>%
  filter(n()>1) %>%
  summarize(
    agility=last(agility),
    consumption=last(consumption),
    score=last(score),
    attention=last(attention),
    precision=last(precision)
  )

#Plot the evolution of each user (Users with more than one simulation)
#pdf(file.path('graphs','replanningSkillsEvolution.pdf'))
par(mfcol = c(5, 4),mar = c(1, 1, 2, 1),oma = c(3, 0, 3, 0))

for (i in 1:nrow(firstUserReplanningMetrics)) {
  plotHelper.spider(data=rbind(firstUserReplanningMetrics[i,],lastUserReplaningMetrics[i,]),
                    x=2:6,
                    y=1:2,
                    main=firstUserReplanningMetrics$user[[i]],
                    cex=1,
                    scale=1,
                    center=FALSE,
                    labels=c("A","C","S","AT","P"),
                    fill=FALSE,
                    overlay=TRUE,
                    connect=TRUE,
                    lwd=3)
}
mtext("Replanning Skills Evolution", side = 3, outer = TRUE, line = 1)
legend(x=-6,y=-1.4,
       legend=c("First simulation", "Last simulation"),
       lty=c("solid","dashed"),
       col=c("red","blue"),
       horiz = TRUE,
       lwd=c(3,3),
       xpd=NA)
#dev.off()
