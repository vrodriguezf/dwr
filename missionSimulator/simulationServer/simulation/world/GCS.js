/**
 * Created by victor on 13/11/14.
 * GCS class
 */

const DEFAULT_NAME = 'GCS',
    DEFAULT_MAXUAV = 3,
    DEFAULT_RANGE = 200;

function GCS(id,position,options) {
    this.id = id;
    this.position = position;

    this.name = (options && options.name)
        ?   options.name
        :   DEFAULT_NAME;

    this.maxUAVs = (options && options.maxUAVs)
        ?   options.maxUAVs
        :   DEFAULT_MAXUAV;

    this.withinRange = (options && options.withinRange)
        ?   options.withinRange
        :   DEFAULT_RANGE;
}

module.exports = GCS;