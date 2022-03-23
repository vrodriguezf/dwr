library('ProjectTemplate')
load.project()

result <- students.simulations %>%
  group_by(simulationID) %>%
  filter(!dataHelper.isOutlier(simulationID)) %>%
  summarise(
      score = metric.score(simulationID)
    )

# Density curve
ggplot(result, aes(x=score)) + geom_density(aes(y=..scaled..),size=2) +
  geom_vline(aes(xintercept=mean(score, na.rm=T)),   # Ignore NA values for mean
             color="red", linetype="dashed", size=1)

#Tests
#result <- metric.score('ObjectID(545a3795fd19ec4943e36055)')
