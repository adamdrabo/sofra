const jwt = require('jsonwebtoken');

function signerJeton(compteId) {
  return jwt.sign({ sub: String(compteId) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || '7d',
    algorithm: 'HS256',
  });
}

function verifierJeton(jeton) {
  return jwt.verify(jeton, process.env.JWT_SECRET, { algorithms: ['HS256'] })
}

module.exports = { signerJeton, verifierJeton }
