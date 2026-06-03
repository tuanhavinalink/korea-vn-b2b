export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Users, Phone, Mail, Globe, Heart } from 'lucide-react'

export default async function AdminMembersPage() {
  const profile = await getCurrentProfile().catch(() => null)
  if (!profile || profile.role !== 'admin') redirect('/login')

  const supabase = createAdminClient()

  const { data: members } = await supabase
    .from('vn_members')
    .select('*')
    .order('created_at', { ascending: false })

  // Get favorite counts per member
  const { data: favCounts } = await supabase
    .from('favorites')
    .select('vn_member_id')

  const favCountMap: Record<string, number> = {}
  favCounts?.forEach((f: any) => {
    favCountMap[f.vn_member_id] = (favCountMap[f.vn_member_id] ?? 0) + 1
  })

  // Get event interest counts per member
  const { data: eventCounts } = await supabase
    .from('event_interests')
    .select('vn_member_id')

  const eventCountMap: Record<string, number> = {}
  eventCounts?.forEach((e: any) => {
    eventCountMap[e.vn_member_id] = (eventCountMap[e.vn_member_id] ?? 0) + 1
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vietnamese Members</h1>
          <p className="text-gray-500 mt-1">{members?.length ?? 0} registered buyers</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Member</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Company / Position</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Contact</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Sector</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Activity</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members?.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{m.full_name}</p>
                    {m.partnership_needs && (
                      <p className="text-xs text-gray-400 mt-1 max-w-[200px] line-clamp-2">{m.partnership_needs}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-800">{m.company_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{m.position}</p>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1 text-korean-blue hover:underline">
                      <Mail size={12} /> {m.email}
                    </a>
                    {m.phone && (
                      <a href={`tel:${m.phone}`} className="flex items-center gap-1 text-gray-500 hover:text-gray-800">
                        <Phone size={12} /> {m.phone}
                      </a>
                    )}
                    {m.website && (
                      <a href={m.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-500 hover:text-gray-800">
                        <Globe size={12} /> {m.website}
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {m.business_sector ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-korean-red font-semibold">
                        <Heart size={12} fill="currentColor" /> {favCountMap[m.id] ?? 0}
                      </span>
                      <span className="flex items-center gap-1 text-purple-600 font-semibold">
                        📅 {eventCountMap[m.id] ?? 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(m.created_at).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!members || members.length === 0) && (
            <div className="text-center py-16 text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p>No Vietnamese members registered yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

