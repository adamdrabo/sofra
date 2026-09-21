const jwt = require('jsonwebtoken');

function genererJeton(compte) {
  return jwt.sign(
    { id: compte._id, courriel: compte.courriel },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

module.exports = { genererJeton };
