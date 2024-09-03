const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader;

  if (token == null) return res.status(401).json({  message: 'Non authentifié' });

  jwt.verify(token, "FreePay2024", (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalide' });
    next();
  });

};

module.exports = authMiddleware;