import { NextRequest, NextResponse } from 'next/server';
import { verifyProLicenseKeyServer } from '@/src/lib/licenseAuth';

export async function POST(req: NextRequest) {
  let key = '';
  try {
    const body = (await req.json()) as { key?: unknown };
    if (typeof body?.key === 'string') {
      key = body.key;
    }
  } catch {
    return NextResponse.json(
      { valid: false, error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const result = verifyProLicenseKeyServer(key);
  if (!result.valid) {
    return NextResponse.json(
      { valid: false, error: result.reason || 'Invalid license key.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    valid: true,
    tier: result.tier,
  });
}
