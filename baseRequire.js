/**
 * Created by victor on 11/11/14.
 */
var projectDir = __dirname;

module.exports = GLOBAL.baseRequire = function(module) {
    return require(projectDir + module);
}