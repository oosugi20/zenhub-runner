module.exports = {
  noEstimateIssues: require('./runners/check-no-estimate-issues.js'),
  cleanupMonthlyEpic: require('./runners/cleanup-monthly-epic.js'),
  checkAllClosedHasInMonthly: require('./runners/check-all-closed-has-in-monthly.js'),
};
