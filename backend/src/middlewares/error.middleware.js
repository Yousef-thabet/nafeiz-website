const { sendError } = require('../utils/response');
const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
  let statusCode = Number(err?.statusCode) || 500;
  let message = 'Internal server error';
  let errors = {};

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      const target = err?.meta?.target || [];
      const field = Array.isArray(target) && target.length ? String(target[0]) : 'field';
      message = 'A product with this value already exists.';
      errors = { [field]: 'This value already exists.' };
    } else if (err.code === 'P2023') {
      statusCode = 400;
      message = 'Invalid database value.';
      errors = { general: 'One or more values are invalid.' };
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found.';
      errors = { general: 'The requested record was not found.' };
    }
  }

  if (err?.message && statusCode < 500 && !Object.keys(errors).length) {
    message = err.message;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('Unhandled API error:', err?.message || err);
  }

  return sendError(res, message, errors, statusCode);
};

module.exports = { errorHandler };
