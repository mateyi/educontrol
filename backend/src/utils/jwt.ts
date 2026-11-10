import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'educontrol-jwt-super-secret-key-laboratorio-software-2026';

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: '7d',
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
