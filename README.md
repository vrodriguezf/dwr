# Drone Watch And Rescue

This repository contains the source code and the documentation of the multiUAV-simulation toolkit ["Drone Watch & Rescue"](https://www.researchgate.net/profile/Mohamed-Mourad-Lafifi/post/Where_can_I_find_a_UAV_simulator_thats_similar_in_function_to_SUMO/attachment/5e4a4c113843b06506dbcacb/AS%3A848654415962113%401579346388270/download/Design+and+Development+of+a+Lightweight+Multi-UAV+Simulator+_+Rodriguez-Fernandez2015.pdf)

## Description

Drone Watch And Rescue is an online set of applications to create and simulate multi-UAV missions. The funcionality of this application is divided in three main tools:

* Mission designer: Used by an operator to create new missions.
* Scenary scheduler: Used by a trainer to define both the mission incidents plan and the interactions that should be done by the mission monitorer during the execution of a mission.
* Mission simulator: Execute the missions created in the previous tools.

## Requisites

There are some requisites needed before installing and deploying the Drone Watch And Rescue server:

* [NodeJS](http://nodejs.org/)
* [Bower](http://bower.io/)
Once installed NodeJS, open a terminal and execute: 

```
#!javascript

npm install -g bower
```


* [MongoDB](http://www.mongodb.org/)

## Installation

Clone this repository anywhere in your computer, and follow these steps:

1. Open a terminal and go to the root of this project.

2. Execute the command

```
#!javascript

npm install
```
 (Required NodeJS installed in the system)

3. Execute the command
```
#!javascript

bower install
```

4. Execute the command
```
#!javascript

node app.js
```

The Drone Watch And Rescue Server will be deployed at [localhost:8888](http://localhost:8888)

## License

Víctor Rodríguez Fernández, Antonio González Pardo, David Camacho Fernández.

Artificial Intelligence and Data Analysis (AIDA).

Universidad Politecnica de Madrid
