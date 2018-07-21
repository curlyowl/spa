require('dotenv').config(); // read .env files

const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
const { getRates } = require('./lib/fixer-service');

// Set public folder as root
app.use(express.static('public'));

// Allow front-end access to node_modules folder
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

const errorHandler = (err, req, res) => {
  if (err.response) {
    // сервер вернул статускод не 2xx
    res.status(403).send({
      title: 'Server responded with an error',
      message: err.message
    });
  } else if (err.request) {
    // ответ от сервера не пришел
    res.status(503).send({
      title: 'Unable to communicate with server',
      message: err.message
    })
  } else {
    res.status(500).send({
      title: 'An unexpected error occurred',
      message: err.message
    });
  }

};

app.get('/api/rates', async (req, res) => {
  try {
    const data = await getRates();

    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

// Listen for HTTP requests on port 3000
app.listen(port, () => {
  console.log('listening on %d', port);
});
