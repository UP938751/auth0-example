async function fetchAuthConfig() {
  const response = await fetch('/auth-config');
  if (response.ok) {
    return response.json();
  } else {
    throw response;
  }
}

// global variable that is our entry point to the auth library
// the linter would complain that we don't use this variable yet, so we stop that with the next line
// eslint-disable-next-line no-unused-vars
let auth0 = null;

async function initializeAuth0Client() {
  const config = await fetchAuthConfig();

  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
  });
}

// this will run when the page loads
async function init() {
  await initializeAuth0Client();
  console.log('auth0 initialized');
  console.log({ auth0 });
}

window.addEventListener('load', init);
