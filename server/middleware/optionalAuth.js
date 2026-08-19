const jwt = require("jsonwebtoken");

/*
  =========================================
  OPTIONAL AUTH

  Used on routes that guests are allowed to
  hit (e.g. posting a public review), but
  where we still want to know who the user
  is *if* they're logged in.

  - Valid token  -> req.user is set, continue
  - No token     -> req.user stays undefined, continue
  - Bad token    -> req.user stays undefined, continue
    (we don't 401 here — an expired/garbled
    token shouldn't block a guest action)
  =========================================
*/

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    // Invalid/expired token on an optional route — treat as guest.
  }

  next();
}

module.exports = optionalAuth;
