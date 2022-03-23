library('ProjectTemplate')
load.project()

# Calculate and plot the distribution of the metrics for all the simulations (Removing outliers)

result <- students.simulations %>%
  group_by(simulationID) %>%
  filter(importedMissionPlan.id != 4, !dataHelper.isOutlier(simulationID)) %>%
  summarize(
      agility = metric.agility(simulationID),
      consumption=metric.consumption(simulationID),
      attention=metric.attention(simulationID),
      score=metric.score(simulationID),
      precision=metric.precision(simulationID)
    )
            
print(summary(result))

# Density curves
par(mfcol = c(2, 3),mar = c(1, 1, 2, 1),oma = c(3, 0, 3, 0))

pAgility <- ggplot(result, aes(x=agility)) + geom_density(aes(y=..scaled..),size=2) +
  geom_vline(aes(xintercept=mean(agility, na.rm=T)),   # Ignore NA values for mean
             color="red", linetype="dashed", size=1) + 
              ggtitle("Agility") + 
              theme(plot.title = element_text(lineheight=.8, face="bold"))

pConsumption <- ggplot(result, aes(x=consumption)) + geom_density(aes(y=..scaled..),size=2) +
  geom_vline(aes(xintercept=mean(consumption, na.rm=T)),   # Ignore NA values for mean
             color="red", linetype="dashed", size=1) + 
              ggtitle("Consumption") + 
              theme(plot.title = element_text(lineheight=.8, face="bold"))


pAttention <- ggplot(result, aes(x=attention)) + geom_density(aes(y=..scaled..),size=2) +
  geom_vline(aes(xintercept=mean(attention, na.rm=T)),   # Ignore NA values for mean
             color="red", linetype="dashed", size=1)  + 
              ggtitle("Attention") + 
              theme(plot.title = element_text(lineheight=.8, face="bold"))

pScore <- ggplot(result, aes(x=score)) + geom_density(aes(y=..scaled..),size=2) +
  geom_vline(aes(xintercept=mean(score, na.rm=T)),   # Ignore NA values for mean
             color="red", linetype="dashed", size=1)  + 
              ggtitle("Score") + 
              theme(plot.title = element_text(lineheight=.8, face="bold"))

pPrecision <- ggplot(result, aes(x=precision)) + geom_density(aes(y=..scaled..),size=2) +
  geom_vline(aes(xintercept=mean(precision, na.rm=T)),   # Ignore NA values for mean
             color="red", linetype="dashed", size=1)  + 
              ggtitle("Precision") + 
              theme(plot.title = element_text(lineheight=.8, face="bold"))

grid.arrange(pAgility,pConsumption,pAttention,pScore,pPrecision,ncol=2,main="Metric distribution")