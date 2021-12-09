/* eslint-disable no-unused-vars */
/* eslint-disable indent */

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
