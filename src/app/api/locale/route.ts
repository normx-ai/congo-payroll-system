import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * POST /api/locale
 * Change user's locale preference
 */
export async function POST(req: NextRequest) {
  try {
    const { locale } = await req.json()

    if (!locale || !['fr', 'en'].includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      )
    }

    // Set locale cookie
    const cookieStore = await cookies()
    cookieStore.set('NEXT_LOCALE', locale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
      sameSite: 'lax'
    })

    return NextResponse.json({ success: true, locale })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to set locale' },
      { status: 500 }
    )
  }
}
