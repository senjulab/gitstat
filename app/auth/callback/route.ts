import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=no_user`)
    }

    const isGoogleUser = user.app_metadata.provider === 'google'
    const isGitHubUser = user.app_metadata.provider === 'github'
    
    if (isGoogleUser || isGitHubUser) {
      return NextResponse.redirect(`${origin}/onboard/connect`)
    }

    const hasName = user.user_metadata?.full_name
    
    if (!hasName) {
      return NextResponse.redirect(`${origin}/onboard/profile`)
    }

    return NextResponse.redirect(`${origin}/onboard/connect`)
  }

  return NextResponse.redirect(`${origin}/login`)
}
