# Example of Authentication with Auth0

In the following stages, this is full working **authentication** code for an API-based Web app. This example **does not include authorization** so it cannot be said to be secure; authorization is the full responsibility of your app.

## Stage 1: sign up to Auth0.com and create a tenant, an application, an API

This stage follows [Auth0.com docs: Get Started](https://auth0.com/docs/get-started).

* Sign up to Auth0.com
* In the [Auth0 dashboard](https://manage.auth0.com/dashboard), create a tenant
* Create an application
  * Give it a name of your choice
  * Select "Single Page Web Applications" as the application type
  * Ignore "Quick Start", go to "Settings"
  * Fill out "Allowed Callback URLs" to "http://localhost:8080/"
  * Fill out "Allowed Logout URLs" to "http://localhost:8080/"
  * Fill out "Allowed Web Origins" to "http://localhost:8080" – note the lack of the final slash here
  * Save changes
* Note your application's Domain and Client ID in `server/auth-config.js`

## Stage 2: include the client-side library in your web page ([see the diff](https://github.com/portsoc/auth0-example/commit/stage-2))

Stages 2–4 follow [Auth0.com docs: JavaScript: Login](https://auth0.com/docs/quickstart/spa/vanillajs).

* Create a page `static/index.html`
  * Include the auth0 library from CDN at `https://cdn.auth0.com/js/auth0-spa-js/1.13/auth0-spa-js.production.js`
* Initialize the library in `static/index.js` used from `static/index.html`
* Create a server `server/index.js` that will serve this page
* Also let the server serve the auth config

## Stage 3: include a sign-in button ([see the diff](https://github.com/portsoc/auth0-example/commit/stage-3))

* Include two buttons in the page: login and logout
* Enable only the relevant button when the auth0 library is initialized (login if we're not logged in, logout otherwise)
* Give each button a `click` event listener that will use `auth0` to log in or log out
* Because auth0 gives our page login data in the query, handle that and remove the query from the URL so user isn't confused (function `handleAuth0Redirect`)
* Remember that `server/auth-config.js` must contain your Auth0 application's Domain and Client ID.

## Stage 4: do something in the page on sign-in ([see the diff](https://github.com/portsoc/auth0-example/commit/stage-4))

* To show that we really do know who the user is, put something (e.g. their name and email address) in the page on log in.

Now the page can log in and log out, and knows the user! Success! Next, we need to let the server know who the user is, too.

## Stage 5: use ID token as an auth header in API requests ([see the diff](https://github.com/portsoc/auth0-example/commit/stage-5))

Stages 5–6 follow [Auth0.com docs: JavaScript: Calling an API](https://auth0.com/docs/quickstart/spa/vanillajs/02-calling-an-api).

* In the [Auth0 dashboard](https://manage.auth0.com/dashboard), create an API (like you created an "application" in stage 1).
  * Add the API's Identifier as `audience` in `server/auth-config.js`
  * Add the audience to the Auth0 library `createAuth0Client` call so its tokens are securely specific to this API.
* Add an HTTP API to the server (so far without authentication) that will send back a simple greeting with the current date.
  * We use the `/api/hello` route for that.
  * Test your API from the command line: `curl http://localhost:8080/api/hello` should return the message (if you have the `curl` utility installed)
  * The above test does not use any authentication so it shows that the API works even without a token.
* Add a button in the page that will request the greeting from the API.
* Add an area in the page where the code can put the response.
* In the code that calls the API, include an authentication ID token in the request (it becomes a "Bearer" token in the misnamed HTTP Authorization header).

## Stage 6: server verifies token, can perform authorization ([see the diff](https://github.com/portsoc/auth0-example/commit/stage-6))

* Through our `server/auth0-helpers.js` library, use the `express-oauth2-jwt-bearer` NPM package to verify the JWT tokens (authenticate users).
* Report to the user what their ID is and what their profile looks like; this information would normally all be used by the server.
* Test your API from the command line: `curl http://localhost:8080/api/hello` should say **unauthorized** (in HTTP, that means **not authenticated**; as HTTP uses the word "Forbidden" for not authorized).

**Note: for authorization, your code needs to check what the user is allowed to do, based on their ID or email and what your application knows about them!**
