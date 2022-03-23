/**
 * Created by victor on 28/11/14.
 */
function Airport(id,type,options) {
    this.id = id;
    this.type = type;

    this.name = (options && options.name)
        ?   options.name
        :   null;

    this.runawayLength = (options && options.runawayLength)
        ?   options.runawayLength
        :   null;

    this.launcherType = (options && options.launcherType)
        ?   options.launcherType
        :   null;
}

module.exports = Airport;