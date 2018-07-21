require('dotenv').config(); // read .env files

const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
const { getRates, getSymbols } = require('./lib/fixer-service');
const { convertCurrency } = require('./lib/free-currency-service');
const bodyParser = require('body-parser');

// Set public folder as root
app.use(express.static('public'));

// Allow front-end access to node_modules folder
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

// Parse POST data as URL encoded data
app.use(bodyParser.urlencoded({
  extended: true
}));

// Parse POST data as JSON
app.use(bodyParser.json());

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

// const test = async () => {
//   const data = await getSymbols();
//
//   console.log('test get symbs', data);
// };

// const test = async () => {
//   const data = await convertCurrency('RUB', 'EUR');
//   console.log('convert', data);
// }
//
// test();

app.get('/api/rates', async (req, res) => {
  try {
    const data = await getRates();

    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

app.get('/api/symbols', async (req, res) => {
  try {
    const data = await getSymbols();

    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

app.post('/api/convert', async (req, res) => {
  try {
    const {from, to} = req.body;
    const data = await convertCurrency(from, to);

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
