library('ProjectTemplate')
load.project()

#Calculate all metrics for every simulation
result <- ddply(students.simulations,
                "simulationID",
                summarize,
                agility=metric.agility(simulationID),
                consumption=metric.consumption(simulationID),
                score=metric.score(simulationID),
                attention=metric.attention(simulationID),
                precision=metric.precision(simulationID)
)
View(result)

plotHelper.webplot(result[complete.cases(result),], main="Metrics")