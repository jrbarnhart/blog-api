// Format of token:
// Authorization: Bearer <access_token>

const verifyToken = (req, res, next) => {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    // Verify token here
  } else {
    // Forbidden
    res.status(403).json({
      success: false,
      status: 403,
      message: "Access forbidden",
    });
  }
};

module.exports = verifyToken;
