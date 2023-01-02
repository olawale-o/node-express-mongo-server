module.exports = async function (client) {
  await client.connect();
  await client.db('taskdb').command({ ping: 1 });
  return 'done';
};