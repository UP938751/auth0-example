/* eslint-disable no-unused-vars */
/* eslint-disable indent */

import OAuth2JWTBearer from 'express-oauth2-jwt-bearer';

import fetch from 'node-fetch';

const status401Errors = [
    'UnauthorizedError',
    'InvalidTokenError',
  ];
