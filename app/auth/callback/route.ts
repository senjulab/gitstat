import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Get user data to determine redirect
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=no_user`)
    }

    // Check if user logged in with Google OAuth
    const isGoogleUser = user.app_metadata.provider === 'google'
    
    if (isGoogleUser) {
      return NextResponse.redirect(`${origin}/onboard/connect`)
    }

    // For email OTP users, follow normal flow
    const hasName = user.user_metadata?.full_name
    
    if (!hasName) {
      return NextResponse.redirect(`${origin}/onboard/profile`)
    }

    return NextResponse.redirect(`${origin}/onboard/connect`)
  }

  // No code present, redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
