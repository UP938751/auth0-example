import express from 'express';

import authConfig from './auth-config.js';

const app = express();

// Serves the authentication configuration file to the client-side app
app.get('/auth-config', (req, res) => {
  res.json(authConfig);
});

// a simple API endpoint (route) that will greet anyone
app.get('/api/hello', (req, res) => {
  res.send(`Hello! The time is ${new Date()}`);
});

// this will serve the files present in public/ for all other requests
app.use(express.static(new URL('../public', import.meta.url).pathname));

// start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
