import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  verifySignedAdminToken,
} from '@/src/lib/adminAuth';
import {
  generateSignedProLicenseKey,
  isLicenseSecretConfigured,
} from '@/src/lib/licenseAuth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySignedAdminToken(token)) {
    return NextResponse.json(
      { error: 'Unauthorized. Sign in via /admin to issue Pro license keys.' },
      { status: 401 }
    );
  }

  if (!isLicenseSecretConfigured()) {
    return NextResponse.json(
      {
        error:
          'ADMIN_PASSWORD is not configured on the server. Set ADMIN_PASSWORD to sign license keys.',
      },
      { status: 503 }
    );
  }

  let buyerRef = '';
  try {
    const body = (await req.json()) as { buyerRef?: unknown };
    if (typeof body?.buyerRef === 'string') {
      buyerRef = body.buyerRef.trim().slice(0, 80);
    }
  } catch {
    // Optional body
  }

  const key = generateSignedProLicenseKey();
  if (!key) {
    return NextResponse.json(
      { error: 'Failed to generate signed license key.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    key,
    buyerRef: buyerRef || 'Direct Buyer',
    issuedAt: new Date().toISOString(),
  });
}
