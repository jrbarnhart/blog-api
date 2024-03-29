const jwt = require("jsonwebtoken");

// Format of token:
// Authorization: Bearer <access_token>

const checkTokenRequired = (req, res, next) => {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    // Split token at space
    const bearer = bearerHeader.split(" ");
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    next();
  } else {
    // Forbidden
    res.status(403).json({
      success: false,
      status: 403,
      message: "Access forbidden",
    });
  }
};

const checkTokenPermissive = (req, res, next) => {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    // Split token at space
    const bearer = bearerHeader.split(" ");
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    next();
  } else {
    next();
  }
};

const validateToken = (req, res, next) => {
  jwt.verify(req.token, process.env.LOGIN_TOKEN_SECRET, (err, authData) => {
    if (err) {
      res.status(403).json({
        success: false,
        status: 403,
        message: "Access forbidden",
      });
    } else {
      res.authData = authData;
      next();
    }
  });
};

const isAdminToken = (req, res, next) => {
  if (res.authData && res.authData.user.access !== "admin") {
    res.status(403).json({
      success: false,
      status: 403,
      message: "Access forbidden",
    });
  } else {
    next();
  }
};

module.exports = {
  checkTokenRequired,
  checkTokenPermissive,
  validateToken,
  isAdminToken,
};
