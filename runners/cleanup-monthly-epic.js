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
  const childEpics = monthlyEpic.getChildEpics();

  const promises = [];

  // 先に子に親の情報紐付けておいた方がいい？
  childEpics.forEach(function(childEpic) {
    // closeedなIssueだけ操作。openedなら抜ける
    if (childEpic.hasOpenedChilds()) {
      return;
    }

    // 現状 `Issues` で取得しているデータは今月分のみ。
    // そのため、
    //
    // #1 yyyy年mm月まとめ
    // #2 zz画面作成
    // #3 zz画面: aa機能作成
    // #4 zz画面: bb機能作成
    //
    // とあった場合に、#4だけ先月にcloseしており、他すべて今月のまとめIssueである#1に関連付けていた場合、
    // 先月のIssueのデータはgetできない。
    // ただ、この場合、ここで操作はしたくない、すると先月分が今月分とカウントされてしまうので、
    // 今月以外のIssueを持つchildEpicであれば、なにもしないで抜ける。
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
    promises.push(monthlyEpic.updateEpicAssociation({ removeIssues, addIssues }));
  });

  const result = await Promise.all(promises);
  return result;
};
