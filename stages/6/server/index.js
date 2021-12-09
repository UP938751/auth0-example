import express from 'express';

import authConfig from './auth-config.js';
import auth0Helpers from './auth0-helpers.js';

const app = express();

// serve the auth config publicly
app.get('/auth-config', (req, res) => {
  res.json(authConfig);
});

const auth0 = auth0Helpers(authConfig);

// protect /api from unauthenticated users
app.use('/api', auth0.checkJwt);

app.get('/api/hello', async (req, res) => {
  const userId = auth0.getUserID(req);

  // load the user information, in production this would need caching or storing in a database
  const profile = await auth0.getProfile(req);

  res.send(`Hello user ${userId}, here's your profile:\n${JSON.stringify(profile, null, 2)}`);

  console.log('successful authenticated request by ' + userId);
});

// this will serve the files present in static/ inside this stage
app.use(express.static(new URL('../static', import.meta.url).pathname));

// start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
