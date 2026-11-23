import crypto from 'crypto';

const LICENSE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 chars (no O/0/I/1)
const LICENSE_DOMAIN = 'shivam-devsecops-pro-license-v1';

function getLicenseSigningSecret(): string | null {
  const adminPwd = process.env.ADMIN_PASSWORD?.trim();
  return adminPwd && adminPwd.length > 0 ? adminPwd : null;
}

function bytesToBase32Code(buf: Buffer, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += LICENSE_ALPHABET[buf[i] % LICENSE_ALPHABET.length];
  }
  return out;
}

function computeSignatureSegment(idSegment: string, secret: string): string {
  const digest = crypto
    .createHmac('sha256', `${LICENSE_DOMAIN}:${secret}`)
    .update(`SHIVAM-PRO-${idSegment}`)
    .digest();
  return bytesToBase32Code(digest, 4);
}

export function isLicenseSecretConfigured(): boolean {
  return Boolean(getLicenseSigningSecret());
}

export function generateSignedProLicenseKey(): string | null {
  const secret = getLicenseSigningSecret();
  if (!secret) return null;

  const randBytes = crypto.randomBytes(4);
  const idSegment = bytesToBase32Code(randBytes, 4);
  const sigSegment = computeSignatureSegment(idSegment, secret);

  return `SHIVAM-PRO-${idSegment}-${sigSegment}`;
}

export function verifyProLicenseKeyServer(rawKey: string): {
  valid: boolean;
  tier?: 'owner' | 'pro';
  reason?: string;
} {
  const key = rawKey.trim().toUpperCase();
  if (!key) {
    return { valid: false, reason: 'License key is required.' };
  }

  // 1. Check owner master key (never hardcoded; read from server env)
  const ownerMasterKey = (
    process.env.OWNER_MASTER_KEY ||
    process.env.NEXT_PUBLIC_OWNER_MASTER_KEY ||
    ''
  ).trim();

  if (ownerMasterKey && rawKey.trim() === ownerMasterKey) {
    return { valid: true, tier: 'owner' };
  }

  // 2. Check HMAC-signed client license key: SHIVAM-PRO-XXXX-XXXX
  const match = key.match(/^SHIVAM-PRO-([A-Z0-9]{4})-([A-Z0-9]{4})$/);
  if (!match) {
    return {
      valid: false,
      reason: 'Key must match SHIVAM-PRO-XXXX-XXXX or a valid master key.',
    };
  }

  const secret = getLicenseSigningSecret();
  if (!secret) {
    return {
      valid: false,
      reason:
        'License verification secret (ADMIN_PASSWORD) is not configured on the server.',
    };
  }

  const [, idSegment, providedSig] = match;
  const expectedSig = computeSignatureSegment(idSegment, secret);

  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return {
      valid: false,
      reason: 'Invalid or tampered Pro license key.',
    };
  }

  return { valid: true, tier: 'pro' };
}
