library('ProjectTemplate')
load.project()

#Calculate the attention for every simulation
result <- students.simulations %>%
  group_by(simulationID) %>%
  filter(!dataHelper.isOutlier(simulationID)) %>%
  summarise(
    attention = metric.attention(simulationID)
  )

print(summary(result$attention))

# Density curve
ggplot(result, aes(x=attention)) + geom_density(aes(y=..scaled..),size=2) +
  geom_vline(aes(xintercept=mean(attention, na.rm=T)),   # Ignore NA values for mean
             color="red", linetype="dashed", size=1)