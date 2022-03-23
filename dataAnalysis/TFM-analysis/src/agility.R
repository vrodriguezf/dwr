library('ProjectTemplate')
load.project()

#Calculate the agility for every simulation

result <- students.simulations %>%
  group_by(simulationID) %>%
  filter(!dataHelper.isOutlier(simulationID)) %>%
  summarise(
    agility=metric.agility(simulationID)
  )
head(result)

# Density curve
ggplot(result, aes(x=agility)) + geom_density(aes(y=..scaled..),size=2) +
  geom_vline(aes(xintercept=mean(agility, na.rm=T)),   # Ignore NA values for mean
             color="red", linetype="dashed", size=1)