/* Handle validation errors object created by express validator

-returnedValuesArray must be array of strings that corrospond to values on req.body that are to
be returned with the response 
    
-validationErrors must be the object returned from express-validator valdiationResult(req) */

const handleValidationErrors = (returnedValuesArray, validationErrors) => {
  (req, res, next) => {
    if (!validationErrors.isEmpty()) {
      // Create json response object
      const responseJson = {
        success: false,
        errors: validationErrors.array(),
      };

      // Check that returnedValuesArray is an array or add an error
      if (!Array.isArray(returnedValuesArray)) {
        responseJson.errors.push({
          message: "Returned values must be array of strings",
        });
      } else {
        // Add the values to the json response
        returnedValuesArray.forEach((value) => {
          if (typeof value === "string") {
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
