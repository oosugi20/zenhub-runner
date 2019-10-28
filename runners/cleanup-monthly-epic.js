const Issues = require('../lib/Issues');


module.exports = async function(ownerName, repoName, issueNumber) {
  const myIssues = new Issues(ownerName, repoName);
  await myIssues.fetch();

  const monthlyEpic = myIssues.getByIssueNumber(issueNumber);

  // zenhubのepicに紐付けられたissuesは、別のリポジトリの可能性がある。
  //
  // Rみたいに、いくつかのリポジトリのまとめIssueを作ってると、
  // myIssuesでは指定のリポジトリの内容しか取ってきてないので、
  // なんとかする必要がある。
  //
  // ひとまず、いちリポジトリの月時まとめを想定し、
  // 月時まとめEpicの子Issuesに別のリポジトリのIssueが入らない想定とする。
  //
  // TODO また、先月のIssueとかがあると、取得できてない気がする
  const childEpics = monthlyEpic.getChildEpics();

  const promises = [];

  // 先に子に親の情報紐付けておいた方がいい？
  childEpics.forEach(function(childEpic) {
    if (childEpic.hasOpenedChilds()) {
      return;
    }

    // openedがないなら === 全部閉じられてるなら、
    // childEpic自体にmonthlyEpicを紐付け ==> 先月のIssueとか持ってたら？
    // childEpic自体をclose => closeは手動でやらせたほうがいいかも
    // childEpicのchildsからmonthlyEpicを外す

    if (childEpic.hasChildsOtherThanThisMonth()) {
      return;
    }

    const removeIssues = [];
    const addIssues = [];

    const childEpicChilds = childEpic.getChilds();
    childEpicChilds.forEach(function(issue) {
      const hasInChilds = monthlyEpic.hasInChilds(issue.getNumber());
      if (hasInChilds) {
        const removeIssueData = 
        removeIssues.push(issue.toDataForRemove());
      }
    });

    if (!removeIssues.length) {
      return;
    }

    // 全部今月でcloseされてるなら、子からmonthlyEpicはずす
    // 子は親Epic情報を持っていないので、
    // monthlyEpic側から子の関連付けを外す
    promises.push(monthlyEpic.updateZenhubAssociation({ removeIssues, addIssues }));
  });

  const result = await Promise.all(promises);
  return result;
};
