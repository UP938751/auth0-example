import express from 'express';

import authConfig from './auth-config.js';

const app = express();

// Serves the authentication configuration file to the client-side app
app.get('/auth-config', (req, res) => {
  res.json(authConfig);
});

// this will serve the files present in static/ for all other requests
app.use(express.static(new URL('../static', import.meta.url).pathname));

// start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
