console.log('zenhub-runner');

const Issues = require('./lib/Issues');

module.exports = {
  noEstimateIssues: async function() {
    const myIssues = new Issues();
    await myIssues.fetch();

    return myIssues.filterClosedAndNoEstimate();
  },

  cleanupMonthlyEpic: require('./lib/cleanup-monthly-epic.js')
};
