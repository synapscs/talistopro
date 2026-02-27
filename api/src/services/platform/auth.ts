import { createHmac } from 'crypto';

// Simple JWT-like tokens (HS256) without external dependencies.
// NOT for production-grade auth; only a skeleton for platform-admin authentication in this repo.
const SECRET = process.env.PLATFORM_JWT_SECRET || 'dev-platform-secret';

function b64url(input: Buffer | string): string {
  const b = typeof input === 'string' ? Buffer.from(input) : input;
  return b.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function encodeHeader(): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  return b64url(Buffer.from(JSON.stringify(header)));
}

export function signToken(payload: any): string {
  // payload should include exp (unix seconds)
  const payloadStr = JSON.stringify(payload);
  const encodedHeader = encodeHeader();
  const encodedPayload = b64url(Buffer.from(payloadStr));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac('sha256', SECRET).update(data).digest();
  const encodedSignature = b64url(signature);
  return `${data}.${encodedSignature}`;
}

export function verifyToken(token: string): any | null {
  try {
    const [hdr, payload, sig] = token.split('.');
    if (!hdr || !payload || !sig) return null;
    const data = `${hdr}.${payload}`;
    const expectedSig = createHmac('sha256', SECRET).update(data).digest();
    const expected = b64url(expectedSig);
    if (sig !== expected) return null;
    const payloadObj = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (payloadObj.exp && Math.floor(Date.now() / 1000) > payloadObj.exp) return null;
    return payloadObj;
  } catch {
    return null;
  }
}

export const PlatformAuthService = {
  signToken,
  verifyToken,
};
