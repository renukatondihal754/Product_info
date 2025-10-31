/**
 * Request Validation Middleware
 * Validates incoming request data
 */

/**
 * Validate offer data
 */
function validateOffer(req, res, next) {
  const { name, value_props, ideal_use_cases } = req.body;

  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('name is required and must be a non-empty string');
  }

  if (!value_props || !Array.isArray(value_props) || value_props.length === 0) {
    errors.push('value_props is required and must be a non-empty array');
  }

  if (!ideal_use_cases || !Array.isArray(ideal_use_cases) || ideal_use_cases.length === 0) {
    errors.push('ideal_use_cases is required and must be a non-empty array');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

/**
 * Validate file upload
 */
function validateFileUpload(req, res, next) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded. Please upload a CSV file.'
    });
  }

  next();
}

module.exports = {
  validateOffer,
  validateFileUpload
};