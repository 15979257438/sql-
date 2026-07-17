import { Response } from 'express';

export function success<T>(res: Response, data: T, message = 'ok') {
  res.json({ code: 0, message, data });
}

export function fail(res: Response, message: string, code = 1, status = 400) {
  res.status(status).json({ code, message, data: null });
}
