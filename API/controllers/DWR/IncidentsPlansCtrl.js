/**
 * Created by victor on 17/11/14.
 */
var IncidentsPlanModel = baseRequire('/API/models/DWR/IncidentPlans').get();
var _ = require('lodash');
var util = require('util');

exports.findAllIncidentsPlans = function (req,res) {
};

exports.getByMission = function (req, res) {
    IncidentsPlanModel.getByMission(req.params['missionId'], function (err, result) {
        if (err) {
            console.log('ERRORRRR');
        }
        res.send(result);
    });
};

exports.addIncidentsPlan = function (req,res) {
    var reqIncidentsPlan = req.body;
    var incidentsPlanToSave = {};

    incidentsPlanToSave._id = reqIncidentsPlan._id;
    incidentsPlanToSave.test = reqIncidentsPlan.test;
    incidentsPlanToSave.missionId = reqIncidentsPlan.missionId;
    incidentsPlanToSave.incidents = [];

    _(reqIncidentsPlan.incidents).forEach(function (incident) {
        var newIncident = {};
            newIncident._id = incident._id;
            newIncident.type = incident.type;
            newIncident.level = incident.level;
            newIncident.message = incident.message;
            newIncident.startTime = incident.startTime;
            if (incident.endTime != null) newIncident.endTime = incident.endTime;

            //Incident parameters
            if (incident.type == 'DangerArea') {
                newIncident.area = {
                    type: 'polygon',
                    points : _(incident.params.areaPoints).map(function (areaPoint) {
                        if (reqIncidentsPlan.test) {
                            return {
                                x : areaPoint[0],
                                y : areaPoint[1]
                            }
                        }
                        else {
                            return {
                                lat: areaPoint[0],
                                lng: areaPoint[1]
                            }
                        }
                    }).value()
                }
            }
        else if (incident.type == 'PayloadIncident') {
                newIncident.droneId = incident.params.droneId;
            }

        incidentsPlanToSave.incidents.push(newIncident);
    });

    //Save the new incidents plan using the data model
    IncidentsPlanModel.addNewIncidentsPlan(incidentsPlanToSave,function (err, result) {
        if (err) {
            util.log(err);
            res.status(400);
            res.send(err);
        }
        else {
            //util.log('Incidents plan saved successfully - ' + result);
            res.send(result[0]);
        }
    });
};