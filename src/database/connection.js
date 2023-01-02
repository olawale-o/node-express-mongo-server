module.exports = async function connect(client, dbName) {
  await client.connect();
  await client.db(dbName).command({ ping: 1 });
  return 'done';
};
