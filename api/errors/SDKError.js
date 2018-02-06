class SDKError extends Error {
  constructor(message, obj) {
    super(message);
    this.name = 'SDKError';
    this.error = obj.error;
    this.description = obj.error_description;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export {SDKError}
