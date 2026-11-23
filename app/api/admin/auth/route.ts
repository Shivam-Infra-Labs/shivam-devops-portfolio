import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_TTL_SECONDS,
  createSignedAdminToken,
  getConfiguredAdminPassword,
  verifyAdminPassword,
  verifySignedAdminToken,
} from '@/src/lib/adminAuth';

export async function GET(req: NextRequest) {
  const configured = Boolean(getConfiguredAdminPassword());
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authenticated = verifySignedAdminToken(token);

  return NextResponse.json(
    {
      authenticated,
      configured,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const configured = getConfiguredAdminPassword();
  if (!configured) {
    return NextResponse.json(
      {
        authenticated: false,
        configured: false,
        error:
          'ADMIN_PASSWORD is not configured on the server. Set ADMIN_PASSWORD in your server environment variables (never NEXT_PUBLIC_) to unlock the Admin Panel.',
      },
      { status: 503 }
    );
  }

  let submittedPassword = '';
  try {
    const body = (await req.json()) as { password?: unknown };
    if (typeof body?.password === 'string') {
      submittedPassword = body.password;
    }
  } catch {
    return NextResponse.json(
      {
        authenticated: false,
        configured: true,
        error: 'Invalid request body.',
      },
      { status: 400 }
    );
  }

  if (!submittedPassword || !verifyAdminPassword(submittedPassword)) {
    return NextResponse.json(
      {
        authenticated: false,
        configured: true,
        error: 'Invalid admin password.',
      },
      { status: 401 }
    );
  }

  const signedToken = createSignedAdminToken();
  if (!signedToken) {
    return NextResponse.json(
      {
        authenticated: false,
        configured: false,
        error: 'Could not initialize admin session.',
      },
      { status: 500 }
    );
  }

  const response = NextResponse.json({
    authenticated: true,
    configured: true,
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: signedToken,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({
    authenticated: false,
    configured: Boolean(getConfiguredAdminPassword()),
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
