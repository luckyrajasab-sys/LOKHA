import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          details: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
        return;
      }
      res.status(400).json({ error: 'Invalid Request Payload' });
    }
  };
}
