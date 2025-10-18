// app/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = '/account/settings'

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Handle email change confirmation
      if (type === 'email_change') {
        redirectTo.searchParams.set('changed', 'true');
        redirectTo.searchParams.delete('next');
      } else if (type === 'signup') { 
        redirectTo.searchParams.set('verified', 'true');
        redirectTo.searchParams.delete('next');
      }
      return NextResponse.redirect(redirectTo);
    }
  }

  // Jika ada error atau token tidak valid, arahkan ke halaman error
  redirectTo.pathname = '/error'
  return NextResponse.redirect(redirectTo)
}