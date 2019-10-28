const Octokit = require('@octokit/rest');
const ZenHub = require('./util/zenhub.js');

const filterEpics = require('./filter-epics');
const findIssue = require('./find-issue');

const Issues = require('./Issues');


const fs = require('fs');
const path = require('path');
const githubToken = fs.readFileSync(path.resolve(__dirname + '/../config/token/github'), 'utf-8').trim();
const zenhubToken = fs.readFileSync(path.resolve(__dirname + '/../config/token/zenhub'), 'utf-8').trim();


module.exports = async function() {

  const octokit = new Octokit({
    auth: githubToken
  });

  const zenhub = new ZenHub(zenhubToken);

  // TODO
  const owner = 'oosugi20';
  const repo = 'test';


  const today = new Date();
  const thisMonthDate = new Date([
    today.getFullYear(),
    today.getMonth() + 1,
    '01'
  ].join('-'));

  const options = octokit.issues.listForRepo.endpoint.merge({
    owner,
    repo,
    filter: 'all',
    state: 'closed',
    sort: 'updated',
    direction: 'desc',
    since: thisMonthDate.toISOString(),
    per_page: 100,
  });
  const issues = await octokit.paginate(options);

  const repoRes = await octokit.repos.get({
    owner,
    repo,
  });

  const resIssues = [];

  for (const issue of issues) {
    if ('pull_request' in issue) {
      continue;
    }

    const zenhubData = await _fetchZenhubData(repoRes.data.id, issue.number);

    resIssues.push(Object.assign(issue, { zenhubData: zenhubData.data }));
  }

  const epics = filterEpics(resIssues);

  for (const epic in epics) {
    for (const issue in epic.issues) {
      // TODO repo_idが違うときどうするか
      const issueData = findIssue(resIssues, issue.issue_number);
      const parentEpics = issueData.zenhubData.parentEpics || [];
      parentEpics.push(epic.number);
      issueData.zenhubData = Object.assign(issueData.zenhubData, {
        parentEpics
      });
    }
  }
  console.log(epics);

  async function _fetchZenhubData(repoId, issueNumber) {
    const { data, meta } = await zenhub.getIssueData(repoId, issueNumber);
    return { data, meta };
  }



  //const myIssues = new Issues();


  return resIssues;
};
