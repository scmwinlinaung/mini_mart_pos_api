import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { HTTP_STATUS } from '../constants';
import logger from '../utils/logger.util';

export const validate =
  (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      logger.warn('Validation error:', details);

      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        error: 'Validation failed',
        details,
      });
      return;
    }

    // Replace request property with sanitized value
    req[property] = value;
    next();
  };

export default validate;
