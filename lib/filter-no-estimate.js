const _ = require('lodash');

module.exports = function(issues) {
  //return _.filter(issues, (issue) => _.isUndefined(issue.zenhubData.estimate) && !issue.zenhubData.is_epic);
  return _.filter(issues, (issue) => _.isUndefined(issue.zenhubData.estimate));
};
