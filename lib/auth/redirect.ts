import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

/**
 * Determines the appropriate redirect path for a user during onboarding
 * based on their profile completion and connected repositories
 */
export async function getOnboardingRedirect(userId: string): Promise<string> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return '/onboard/profile'

  // Check if user has a name in metadata
  const hasName = user.user_metadata?.full_name
  if (!hasName) return '/onboard/profile'

  // Check if user has connected repositories
  const { data: repos } = await supabase
    .from('connected_repositories')
    .select('repo_full_name')
    .eq('user_id', userId)
    .limit(1)

  if (!repos || repos.length === 0) {
    return '/onboard/connect'
  }

  // User has completed onboarding, go to their repo dashboard
  return `/${repos[0].repo_full_name}`
}
