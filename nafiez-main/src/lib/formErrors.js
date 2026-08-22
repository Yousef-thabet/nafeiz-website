const STATUS_MESSAGES = {
  400: 'Please check the required fields.',
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to perform this action.",
  404: 'The requested item was not found.',
  409: 'This item already exists.',
  408: 'The request timed out. Please try again.',
  422: 'Please check the submitted values.',
  500: 'Something went wrong. Please try again.',
};

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const backendMessage = error?.payload?.message || error?.message;
  const blockedMessages = new Set([
    'Request failed',
    'Failed to fetch',
    'Internal server error',
    'Something went wrong',
  ]);

  if (backendMessage && !blockedMessages.has(backendMessage)) {
    return backendMessage;
  }

  return STATUS_MESSAGES[error?.status] || fallback;
}

export function getApiFieldErrors(error) {
  const rawErrors = error?.payload?.errors;
  if (!rawErrors) return {};

  if (Array.isArray(rawErrors)) {
    return rawErrors.reduce((fieldErrors, item) => {
      if (typeof item === 'string') {
        fieldErrors.general = fieldErrors.general ? `${fieldErrors.general} ${item}` : item;
        return fieldErrors;
      }

      const path = Array.isArray(item?.path) ? item.path.join('.') : item?.path;
      if (path && item?.message) fieldErrors[path] = item.message;
      return fieldErrors;
    }, {});
  }

  if (typeof rawErrors === 'object') {
    return Object.entries(rawErrors).reduce((fieldErrors, [key, value]) => {
      if (typeof value === 'string') {
        fieldErrors[key] = value;
        return fieldErrors;
      }

      if (Array.isArray(value)) {
        fieldErrors[key] = value.join(' ');
        return fieldErrors;
      }

      if (value && typeof value === 'object') {
        fieldErrors[key] = value.message || value.error || 'Invalid value';
      }

      return fieldErrors;
    }, {});
  }

  return {};
}

export function getValidationErrors(values, requiredFields) {
  return requiredFields.reduce((fieldErrors, field) => {
    const value = field.split('.').reduce((current, key) => current?.[key], values);
    if (typeof value !== 'string' || !value.trim()) fieldErrors[field] = 'This field is required.';
    return fieldErrors;
  }, {});
}

export { STATUS_MESSAGES };
