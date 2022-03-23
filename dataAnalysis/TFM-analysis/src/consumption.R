library('ProjectTemplate')
load.project()

#Calculate the consumption for every simulation (removing outliers)

result <- students.simulations %>%
            group_by(simulationID) %>%
            filter(!dataHelper.isOutlier(simulationID)) %>%
            summarise(
                consumption=metric.consumption(simulationID)
              )
View(result)

# 
# #Density curve
ggplot(result, aes(x=consumption)) + geom_density(aes(y=..scaled..),size=2) +
  geom_vline(aes(xintercept=mean(consumption, na.rm=T)),   # Ignore NA values for mean
             color="red", linetype="dashed", size=1)

# result <- metric.consumption('ObjectID(545a22eafd19ec4943e33996)')
# result <- metric.consumption('ObjectID(545a2418fd19ec4943e33e30)')

# result <- metric.consumption('ObjectID(545a37d1fd19ec4943e365ad)')

# result <- metric.consumption('ObjectID(545a38e4fd19ec4943e38e03)')

# result <- metric.consumption('ObjectID(545cdaea6705bd9564ab12f4)')