# ##
# # Load mission info
# ##
# missions <- list(
#   list(
#     environment=fromJSON(file.path("data","missions","testMission01","environment.json")),
#     plan=fromJSON(file.path("data","missions","testMission01","plans.json")),
#     targets=fromJSON(file.path("data","missions","testMission01","targets.json"))
#   ),
#   list(
#     environment=fromJSON(file.path("data","missions","testMission02","environment.json")),
#     plan=fromJSON(file.path("data","missions","testMission02","plans.json")),
#     targets=fromJSON(file.path("data","missions","testMission02","targets.json"))
#   ),
#   list(
#     environment=fromJSON(file.path("data","missions","testMission03","environment.json")),
#     plan=fromJSON(file.path("data","missions","testMission03","plans.json")),
#     targets=fromJSON(file.path("data","missions","testMission03","targets.json"))
#   ),
#   list(
#     environment=fromJSON(file.path("data","missions","testMission04","environment.json")),
#     plan=fromJSON(file.path("data","missions","testMission04","plans.json")),
#     targets=fromJSON(file.path("data","missions","testMission04","targets.json"))
#   )
# )
# 
# 

missions <- data.frame(
    environment=I(list(
        fromJSON(file.path("data","missions","testMission01","environment.json")),
        fromJSON(file.path("data","missions","testMission02","environment.json")),
        fromJSON(file.path("data","missions","testMission03","environment.json")),
        fromJSON(file.path("data","missions","testMission04","environment.json"))
      )),
    plans=I(list(
        fromJSON(file.path("data","missions","testMission01","plans.json")),        
        fromJSON(file.path("data","missions","testMission02","plans.json")),
        fromJSON(file.path("data","missions","testMission03","plans.json")),
        fromJSON(file.path("data","missions","testMission04","plans.json"))
      )),
    targets=I(list(
        fromJSON(file.path("data","missions","testMission01","targets.json")),
        fromJSON(file.path("data","missions","testMission02","targets.json")),
        fromJSON(file.path("data","missions","testMission03","targets.json")),
        fromJSON(file.path("data","missions","testMission04","targets.json"))
      ))
  )

#cache data
cache('missions')