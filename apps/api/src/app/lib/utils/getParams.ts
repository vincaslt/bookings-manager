import { ServerRequest } from 'microrouter';
import { createError } from 'micro';
import { STATUS_ERROR } from '../constants';

export function getParams<K extends string>(
  req: ServerRequest,
  keys: K[]
): { [key in K]: string } {
  const missingKey = keys.find(key => req.params[key] === undefined);

  if (missingKey) {
    throw createError(
      STATUS_ERROR.BAD_REQUEST,
      `Missing parameter ${missingKey}`
    );
  }

  return Object.entries(req.params).reduce((params, [key, value]) => {
    if (!keys.includes(key as K)) {
      throw createError(
        STATUS_ERROR.BAD_REQUEST,
        `Unexpected parameter ${key}`
      );
    }
    return { ...params, [key]: value };
  }, {} as { [key in K]: string });
}
