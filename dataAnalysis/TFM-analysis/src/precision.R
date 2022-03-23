library('ProjectTemplate')
load.project()

#Calculate the precision for every simulation
result <- students.simulations %>%
            group_by(simulationID) %>%
            filter(!dataHelper.isOutlier(simulationID)) %>%
            summarise(
                precision = metric.precision(simulationID)
              )

print(summary(result$precision))

# Density curve
ggplot(result, aes(x=precision)) + geom_density(aes(y=..scaled..),size=2) +
  geom_vline(aes(xintercept=mean(precision, na.rm=T)),   # Ignore NA values for mean
             color="red", linetype="dashed", size=1)