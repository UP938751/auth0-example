async function fetchAuthConfig() {
  const response = await fetch('/auth-config');
  if (response.ok) {
    return response.json();
  } else {
    throw response;
  }
}

// global auth libray entry point variable
let auth0 = null;

// Uses fetchAuthConfig to obtain the configuration file and initialize the auth0 variable
async function initializeAuth0Client() {
  const config = await fetchAuthConfig();

  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
    audience: config.audience,
  });
}

// update the state of all authentication-related elements
async function updateAuthUI() {
  const isAuthenticated = await auth0.isAuthenticated();
  document.getElementById('login').disabled = isAuthenticated;
  document.getElementById('logout').disabled = !isAuthenticated;
  document.getElementById('call').disabled = !isAuthenticated;


  if (isAuthenticated) {
    const user = await auth0.getUser();
    const el = document.getElementById('greeting');
    el.textContent = `Hello ${user.name} (${user.email})!`;
  }
}

async function login() {
  await auth0.loginWithRedirect({
    redirect_uri: window.location.origin, // redirect user back to the same page they are on currently.
  });
}

function logout() {
  auth0.logout({
    returnTo: window.location.origin,
  });
}

async function handleAuth0Redirect() {
  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) return;

  const query = window.location.search;
  if (query.includes('state=')) {
    try {
      // process the login state
      await auth0.handleRedirectCallback();
    } catch (e) {
      window.alert(e.message || 'authentication error, sorry');
      logout();
    }

    // remove the query parameters
    window.history.replaceState({}, document.title, '/');

    await updateAuthUI();
  }
}

async function callServer() {
  // Get the access token from the Auth0 client
  const token = await auth0.getTokenSilently();

  const el = document.getElementById('server-response');
  el.textContent = 'loading…';

  const fetchOptions = {
    credentials: 'same-origin',
    method: 'GET',
    // Give access to the bearer of the token.
    headers: { Authorization: 'Bearer ' + token },
  };
  const response = await fetch('/api/hello', fetchOptions);
  if (!response.ok) {
    // handle the error
    el.textContent = 'Server error:\n' + response.status;
    return;
  }

  // handle the response
  const data = await response.text();
  el.textContent = data;
}

function setupListeners() {
  document.querySelector('#login').addEventListener('click', login);
  document.querySelector('#logout').addEventListener('click', logout);
  document.querySelector('#call').addEventListener('click', callServer);
}


// runs when the page loads
async function init() {
  await initializeAuth0Client();
  await setupListeners();
  await updateAuthUI();
  await handleAuth0Redirect();
}

window.addEventListener('load', init);
