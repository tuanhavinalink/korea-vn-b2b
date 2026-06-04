import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { userId, full_name, company_name, position, phone, email, website, business_sector, partnership_needs } = body

  if (!userId || !email || !full_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { error } = await admin.from('vn_members').insert({
    id: userId,
    full_name,
    company_name: company_name || null,
    position: position || null,
    phone: phone || null,
    email,
    website: website || null,
    business_sector: business_sector || null,
    partnership_needs: partnership_needs || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
