const _ = require('lodash');

module.exports = function(issues) {
  return _.filter(issues, (issue) => issue.zenhubData.is_epic);
};
