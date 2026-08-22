const jwt = require('jsonwebtoken');
const { jwtAccessSecret, jwtRefreshSecret, jwtAccessExpiresIn, jwtRefreshExpiresIn } = require('../config/env');

const createAccessToken = (payload) => jwt.sign(payload, jwtAccessSecret, { expiresIn: jwtAccessExpiresIn });
const createRefreshToken = (payload) => jwt.sign(payload, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
const verifyAccessToken = (token) => jwt.verify(token, jwtAccessSecret);
const verifyRefreshToken = (token) => jwt.verify(token, jwtRefreshSecret);

module.exports = { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken };
