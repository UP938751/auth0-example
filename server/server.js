import express from 'express';

import authConfig from './auth-config.js';

import auth0Helpers from './auth0-helper.js';

const app = express();


// Serves the authentication configuration file to the client-side app
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

// this will serve the files present in public/ for all other requests
// app.use(express.static(new URL('../public', import.meta.url).pathname));
app.use(express.static('public'));

// start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
