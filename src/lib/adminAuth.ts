import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'shivam_admin_session';
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const TOKEN_DOMAIN_KEY = 'shivam-portfolio-admin-session-v1';

export function getConfiguredAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password && password.length > 0 ? password : null;
}

function getSigningKey(adminPassword: string): Buffer {
  const secretSource =
    process.env.ADMIN_SESSION_SECRET?.trim() || adminPassword;
  return crypto
    .createHmac('sha256', TOKEN_DOMAIN_KEY)
    .update(secretSource)
    .digest();
}

export function verifyAdminPassword(submittedPassword: string): boolean {
  const configured = getConfiguredAdminPassword();
  if (!configured) return false;

  const submittedDigest = crypto
    .createHash('sha256')
    .update(submittedPassword)
    .digest();
  const configuredDigest = crypto
    .createHash('sha256')
    .update(configured)
    .digest();

  return crypto.timingSafeEqual(submittedDigest, configuredDigest);
}

export function createSignedAdminToken(): string | null {
  const configured = getConfiguredAdminPassword();
  if (!configured) return null;

  const exp = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${exp}.${nonce}`;
  const signature = crypto
    .createHmac('sha256', getSigningKey(configured))
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
}

export function verifySignedAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const configured = getConfiguredAdminPassword();
  if (!configured) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [expStr, nonce, signature] = parts;
  if (!expStr || !nonce || !signature) return false;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Date.now()) {
    return false;
  }

  const payload = `${expStr}.${nonce}`;
  const expectedSignature = crypto
    .createHmac('sha256', getSigningKey(configured))
    .update(payload)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}
