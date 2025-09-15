require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const port = process.env.WEBHOOK_PORT || 4000;

app.post('/webhook', (req, res) => {
  console.log('Webhook received:', req.body);
  res.sendStatus(200);
});

app.listen(port, () => console.log(`Webhook server running at http://localhost:${port}`));
