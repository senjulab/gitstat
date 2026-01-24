import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getURL } from '@/lib/utils'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const returnTo = requestUrl.searchParams.get('returnTo')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(`${getURL()}login?error=auth_failed`)
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(`${getURL()}login?error=no_user`)
    }

    if (returnTo) {
      // Ensure returnTo starts with / to avoid open redirect vulnerabilities if not careful, 
      // though typically returnTo is a path.
      const cleanReturnTo = returnTo.startsWith('/') ? returnTo.substring(1) : returnTo
      return NextResponse.redirect(`${getURL()}${cleanReturnTo}?openAddModal=true`)
    }

    const isGoogleUser = user.app_metadata.provider === 'google'
    const isGitHubUser = user.app_metadata.provider === 'github'
    
    if (isGoogleUser || isGitHubUser) {
      return NextResponse.redirect(`${getURL()}onboard/connect`)
    }

    const hasName = user.user_metadata?.full_name
    
    if (!hasName) {
      return NextResponse.redirect(`${getURL()}onboard/profile`)
    }

    return NextResponse.redirect(`${getURL()}onboard/connect`)
  }

  return NextResponse.redirect(`${getURL()}login`)
}

