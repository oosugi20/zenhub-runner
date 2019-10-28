const _ = require('lodash');

module.exports = function(issues, issueNumber) {
  return _.find(issues, (issue) => issue.number === issueNumber);
};
