const { validationResult } = require("express-validator");

/* Handle validation errors object created by express validator

-returnedValuesArray must be array of strings that corrospond to values on req.body that are to
be returned with the response */

const handleValidationErrors = (returnedValuesArray) => {
  return (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      // Create json response object
      const responseJson = {
        success: false,
        errors: validationErrors.array(),
      };

      // Check that returnedValuesArray is an array or add an error
      if (!Array.isArray(returnedValuesArray)) {
        const err = new Error("returnedValuesArray must be an array");
        next(err);
      } else {
        // Add the values to the json response
        returnedValuesArray.forEach((value) => {
          if (typeof value !== "string") {
            const err = new Error(
              "returnValuesArray must contain only string values"
            );
          } else {
            responseJson.value = req.body.value;
          }
        });
      }

      // Return the json response
      res.status(403).json(responseJson);
    } else {
      next();
    }
  };
};

module.exports = handleValidationErrors;
