module.exports = (range, fileSize) => {
  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = Math.min(start + 1 * 1e6, fileSize - 1);
  // parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  const chunkSize = end - start + 1;

  return { start, end, chunkSize };
};
