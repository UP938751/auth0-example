import express from 'express';

import authConfig from './auth-config.js';

const app = express();

// serve the auth config publicly
app.get('/auth-config', (req, res) => {
  res.json(authConfig);
});

// this will serve the files present in static/ inside this stage
app.use(express.static(new URL('../static', import.meta.url).pathname));

// start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
