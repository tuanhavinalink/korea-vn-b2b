import { createClient } from './supabase/server'
import { Profile } from '@/types'

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function requireAuth(allowedRoles?: string[]) {
  const profile = await getCurrentProfile()
  if (!profile) throw new Error('Unauthorized')
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    throw new Error('Forbidden')
  }
  return profile
}
