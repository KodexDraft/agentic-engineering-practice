function errorHandler(err, req, res, next) {
  if (err.stack) console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
}

module.exports = { errorHandler };
