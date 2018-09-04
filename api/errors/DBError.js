'use strict';

class DBError extends Error {
  constructor(message, obj) {
    super(message);
    this.name = 'DBError';
    this.error = obj.code;
    this.description = obj.code+' '+obj.errno+' '+obj.sqlMessage ;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export {DBError}
