library('ProjectTemplate')
load.project()

#A user is identified by the tuple (clientIP,createdAt)
# simulationsCountByUser <- ddply(arrange(studentSimulations,X_id),
#                                  c("clientIP","createdAt"),
#                                  summarize,
#                                  missionsPlayed = list(importedMissionPlan.id))

# qplot(c(1,2,3,4),c(1,2,3,4),type="line")

result <- melt(arrange(students.simulations),
             id.vars=c("clientIP","createdAt"),
             measure.vars = c("importedMissionPlan.id"),
             value.name=c("missionPlayed")) %>%
        transmute(
            user = paste(str_sub(createdAt,-2),str_sub(clientIP,-3),sep = "_"),
            missionPlayed = missionPlayed
          )

result <- ddply(result,c("user"),transform,order = seq_along(user))
#qplot(x=order,y = missionPlayed,data = result, colour = user, type = "lines")
# 
# p2 <- ggplot(result, aes(x = order, y = missionPlayed, color = user)) + 
#       geom_line() + 
#       ggtitle("Plot 2")

#Create a grid of plots for each user
# args.list = c(list(p1,p2),list(nrow=1,ncol=2))
# do.call(grid.arrange, args.list)

#plot a grid of the evolution of each player
#pdf(file.path('graphs','missionsPlayedPerUser.pdf'))
  par(mfrow = c(6, 5), mar = c(2, 2, 1, 1), oma = c(3, 3, 0, 0))
  d_ply(result, "user", transform, plot(order,
                                        missionPlayed,
                                        main = unique(user),
                                        type = "o",
                                        xlim=c(1,max(result$order)),
                                        ylim=c(0,4)))
  
  mtext("Simulation Count", side = 1, outer = TRUE, line = 1)
  mtext("Mission played", side = 2, outer = TRUE, line = 1)
#dev.off()