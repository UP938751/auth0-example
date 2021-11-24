/*
 * Library for easier working with Auth0 through express-oauth2-jwt-bearer.
 *
 * Usage:
 *
 * ```
 * import auth0Helpers from './auth0-helpers.js';
 * const auth0 = auth0Helpers(authConfig);
 * ```
 *
 * authConfig must have the following structure:
 * {
 *   domain: 'YOUR_DOMAIN',
 *   clientId: 'YOUR_CLIENT_ID',
 *   audience: 'YOUR_API_AUDIENCE',
 * }
 *
 * To protect a whole route from unauthenticated requests:
 *
 * ```
 * app.use('/api', auth0.checkJwt);
 * ```
 *
 * To get a user ID where required inside a route handler:
 *
 * ```
 * const userId = auth0.getUserID(req);
 * ```
 *
 * To load the user information: (in production this would need caching or storing in a database)
 *
 * ```
 * const profile = await auth0.getProfile(req);
 * ```
 */

import OAuth2JWTBearer from 'express-oauth2-jwt-bearer';

import fetch from 'node-fetch';

const status401Errors = [
  'UnauthorizedError',
  'InvalidTokenError',
];

export default function setup(authConfig) {
  const checker = OAuth2JWTBearer.auth({
    audience: authConfig.audience,
    issuerBaseURL: `https://${authConfig.domain}`,
  });

  return {
    getUserID,
    checkJwt,
    getProfile,
  };

  function getUserID(req) {
    if (!req.auth || !req.auth.payload) return null;

    // this is where OAuth2JWTBearer puts the user ID:
    return req.auth.payload.sub;
  }

  // use OAuth2JWTBearer to check the actual token, but handle 401 errors
  function checkJwt(req, res, next) {
    return checker(req, res, (err) => {
      if (err && status401Errors.includes(err.name)) {
        res.sendStatus(401);
      } else {
        next(err);
      }
    });
  }

  async function getProfile(req) {
    // if we don't have any auth information, there will be no profile
    if (!req.auth || !req.auth.token) return null;

    try {
      const response = await fetch(`https://${authConfig.domain}/userinfo`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${req.auth.token}`,
        },
      });

      if (!response.ok) throw response;

      return await response.json();
    } catch (err) {
      console.error('error getting auth profile', req.auth, err);
      return null;
    }
  }
}
