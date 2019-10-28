const Issues = require('./lib/Issues');

module.exports = {
  noEstimateIssues: async function(ownerName, repoName) {
    const myIssues = new Issues(ownerName, repoName);
    await myIssues.fetch();

    return myIssues.filterClosedAndNoEstimate();
  },

  cleanupMonthlyEpic: require('./lib/cleanup-monthly-epic.js')
};
