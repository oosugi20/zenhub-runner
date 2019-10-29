const request = require('request-promise-native');
const readToken = require('./read-token');
const zenhubToken = readToken('zenhub');

class ZenHub {
  constructor() {
    this.apiKey = zenhubToken;
    this.baseUrl = 'https://api.zenhub.io/p1';
  }

  async _call(method, path, body) {
    const options = {
      headers: {
        'x-authentication-token': this.apiKey
      },
      method,
      uri: this.baseUrl + path,
      json: true,
      resolveWithFullResponse: true,
    };

    if (body) {
      options.body = body;
    }

    const res = await request(options);

    // only for the sake of using response headers, we need this class!
    return { data: res.body, meta: res.headers };
  }

  async getIssueData(repoId, issueNo) {
    const method = 'GET';
    const path = `/repositories/${repoId}/issues/${issueNo}`;

    const res = await this._call(method, path);
    return res;
  }

  /**
   * @param {string} epicId - Github issue number
   */
  async getEpicData(repoId, epicId) {
    const method = 'GET';
    const path = `/repositories/${repoId}/epics/${epicId}`;
    const res = await this._call(method, path);
    return res;
  }

  /**
   * @param {array} removeIssues - [{ repo_id, issue_number }...]
   * @param {array} addIssues - [{ repo_id, issue_number }...]
   */
  async updateEpicAssociation(repoId, issueNumber, { removeIssues, addIssues }) {
    const method = 'POST';
    const path = `/repositories/${repoId}/epics/${issueNumber}/update_issues`;
    const body = {
      remove_issues: removeIssues,
      add_issues: addIssues
    };
    const res = await this._call(method, path, body);
    return res;
  }
}

module.exports = ZenHub;
