/*
 * Performs data validation on an object by verifying that it contains
 * all required fields specified in a given schema.
 *
 * Returns true if the object is valid agianst the schema and false otherwise.
 */
exports.validateAgainstSchema = function (obj, schema) {
  return obj && Object.keys(schema).every(
    field => {
      if (!(!schema[field].required || obj.hasOwnProperty(field))) {
        console.log("field:", field, "is REQUIRED but not present")
      }
      
      return !schema[field].required || obj.hasOwnProperty(field)}
  );
};

/*
 * Extracts all fields from an object that are valid according to a specified
 * schema.  Extracted fields can be either required or optional.
 *
 * Returns a new object containing all valid fields extracted from the
 * original object.
 */
exports.extractValidFields = function (obj, schema) {
  let validObj = {};
  Object.keys(schema).forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(obj, field)) {
      validObj[field] = obj[field];
    }
  });
  return validObj;
};
