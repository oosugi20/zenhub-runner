const request = require('request-promise-native');
const readToken = require('./read-token');
const token = readToken('zenhub');
const baseUrl = 'https://api.zenhub.io/p1';

module.exports = {
  fetchIssueData: async function(repoId, issueNo) {
    const method = 'GET';
    const path = `/repositories/${repoId}/issues/${issueNo}`;

    const res = await _call(method, path);
    return res;
  },

  /**
   * @param {string} epicId - Github issue number
   */
  fetchEpicData: async function(repoId, epicId) {
    const method = 'GET';
    const path = `/repositories/${repoId}/epics/${epicId}`;
    const res = await _call(method, path);
    return res;
  },

  /**
   * @param {array} removeIssues - [{ repo_id, issue_number }...]
   * @param {array} addIssues - [{ repo_id, issue_number }...]
   */
  updateEpicAssociation: async function(repoId, issueNumber, { removeIssues, addIssues }) {
    const method = 'POST';
    const path = `/repositories/${repoId}/epics/${issueNumber}/update_issues`;
    const body = {
      remove_issues: removeIssues,
      add_issues: addIssues
    };
    const res = await _call(method, path, body);
    return res;
  }
}


async function _call(method, path, body) {
  const options = {
    headers: {
      'x-authentication-token': token
    },
    method,
    uri: baseUrl + path,
    json: true,
    resolveWithFullResponse: true,
  };

  if (body) {
    options.body = body;
  }

  const res = await request(options);

  return { data: res.body, meta: res.headers };
}
