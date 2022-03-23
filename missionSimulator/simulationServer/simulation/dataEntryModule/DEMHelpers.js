/**
 * Created by victor on 13/11/14.
 */
var _ = require('lodash');
var SphericalMercator = require('sphericalmercator');

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = (function (){
    var merc = new SphericalMercator();

    return {
        fromLatLonToXYInKm : function (latLon) {
            if (!latLon) return null;

            var cartesians = _(merc.forward([latLon.lng,latLon.lat])).map(function (coord) {return coord/1000;}).value();
            return {
                x : cartesians[0],
                y: cartesians[1]
            }
        },
        identity : function(coords) {
            return coords;
        },
        inputTimeToWaypointTime : function (time) {
            if (time == null) {
                return null;
            }
            else if (isNumber(time)) {
                return time*3600;
            }
            else {
                //Date?
                return time
            }
        }
    }
}());