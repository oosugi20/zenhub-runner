const fs = require('fs');
const path = require('path');

const rootDir = '../..';
const tokenDir = 'config/token'

module.exports = function(tokenName) {
  const resolvedPath = path.resolve(__dirname, rootDir, tokenDir, tokenName);
  const isExist = fs.existsSync(resolvedPath);

  if (!isExist) {
    console.error({
      messege: `ファイルが存在しません。`,
      filePath: resolvedPath
    });
    return;
  }

  return fs.readFileSync(resolvedPath, 'utf-8').trim();
};
