console.log('zenhub-runner');

const fetchIssues = require('./lib/fetch-issues.js');
const filterNoEstimate = require('./lib/filter-no-estimate.js');


const Issues = require('./lib/Issues');

module.exports = {
  noEstimateIssues: async function() {
    const myIssues = new Issues();
    await myIssues.fetch();

    return myIssues.filterClosedAndNoEstimate();

    //const filterIssues = await _filterIssues();
    //return filterIssues;

    //async function _filterIssues() {
    //  const issues = await fetchIssues();
    //  const filterdIssues = filterNoEstimate(issues);
    //  return filterdIssues;
    //}
  },

  cleanupMonthlyEpic: require('./lib/cleanup-monthly-epic.js')
};
