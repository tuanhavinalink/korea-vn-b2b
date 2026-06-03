import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile().catch(() => null)
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, password, companyId } = await req.json()

  if (!email || !password || !companyId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Create auth user
  const { data: user, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'korean' },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Set profile with korean role + company
  const { error: profileError } = await supabase.from('profiles')
    .upsert({ id: user.user.id, role: 'korean', company_id: companyId })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, userId: user.user.id })
}
