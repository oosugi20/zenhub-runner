module.exports = function() {
  const today = new Date();
  const thisMonthDate = new Date([
    today.getFullYear(),
    today.getMonth() + 1,
    '01'
  ].join('-'));

  return thisMonthDate.toISOString();
};
