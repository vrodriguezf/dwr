var projectDir = __dirname + '/simulation';

module.exports = GLOBAL.projRequire = function(module) {
  return require(projectDir + module);
}