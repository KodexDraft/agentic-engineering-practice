const express = require('express');
const { PORT } = require('./utils/constants');
const { router } = require('./routes');
const { requestLogger } = require('./middleware/request-logger');
const { errorHandler } = require('./middleware/error-handler');

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get('/', (req, res) => {
  res.json({ name: 'Taskr API', version: '1.0.0', docs: '/health' });
});

app.use(router);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Taskr API running on port ${PORT}`);
  });
}

module.exports = app;
