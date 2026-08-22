const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const sendError = (res, message, errors = [], statusCode = 400) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

const formatValidationErrors = (issues = []) => issues.map((issue) => ({
  path: issue.path || [],
  message: issue.message,
}));

module.exports = { sendSuccess, sendError, formatValidationErrors };
