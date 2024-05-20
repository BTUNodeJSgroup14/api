const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  let token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }

  // if the token includes 'Bearer ', remove it
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
  return next();
}

module.exports = verifyToken;