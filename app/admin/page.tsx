export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, Users, Calendar, Heart, Package, ChevronRight } from 'lucide-react'

export default async function AdminDashboard() {
  const profile = await getCurrentProfile().catch(() => null)
  if (!profile || profile.role !== 'admin') redirect('/login')

  const supabase = createAdminClient()

  const [
    { count: companyCount },
    { count: memberCount },
    { count: eventCount },
    { count: favCount },
    { data: recentFavs },
    { data: recentMembers },
  ] = await Promise.all([
    supabase.from('korean_companies').select('*', { count: 'exact', head: true }),
    supabase.from('vn_members').select('*', { count: 'exact', head: true }),
    supabase.from('zoom_events').select('*', { count: 'exact', head: true }),
    supabase.from('favorites').select('*', { count: 'exact', head: true }),
    supabase.from('favorites').select(`
      *, vn_members(full_name, company_name, email),
      korean_companies(name), products(name)
    `).order('created_at', { ascending: false }).limit(10),
    supabase.from('vn_members').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage the Korea-VN B2B platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Korean Companies', value: companyCount ?? 0, icon: Building2, color: 'text-korean-blue', bg: 'bg-korean-blue/10' },
          { label: 'Vietnamese Members', value: memberCount ?? 0, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'ZOOM Events', value: eventCount ?? 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Favorites', value: favCount ?? 0, icon: Heart, color: 'text-korean-red', bg: 'bg-red-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-6">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${bg} ${color} mb-3`}>
              <Icon size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { href: '/admin/companies', label: 'Manage Companies', desc: 'Add, edit Korean companies & products', icon: Building2 },
          { href: '/admin/events', label: 'Manage ZOOM Events', desc: 'Create and manage meeting schedules', icon: Calendar },
          { href: '/admin/members', label: 'View Members', desc: 'All Vietnamese buyers + favorites', icon: Users },
        ].map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href} className="card p-6 hover:shadow-md transition-all group flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Icon size={20} className="text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-korean-red transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Favorites */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Heart size={16} className="text-korean-red" /> Recent Favorites
            </h2>
            <Link href="/admin/members" className="text-xs text-korean-blue hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentFavs?.map((fav: any) => (
              <div key={fav.id} className="px-6 py-3">
                <p className="text-sm font-medium text-gray-800">{fav.vn_members?.full_name ?? 'Unknown'}</p>
                <p className="text-xs text-gray-400">
                  Loved: {fav.korean_companies?.name || fav.products?.name}
                  · {new Date(fav.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Members */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Users size={16} className="text-green-600" /> Recent Registrations
            </h2>
            <Link href="/admin/members" className="text-xs text-korean-blue hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentMembers?.map((m: any) => (
              <div key={m.id} className="px-6 py-3">
                <p className="text-sm font-medium text-gray-800">{m.full_name}</p>
                <p className="text-xs text-gray-400">
                  {m.company_name} · {m.email}
                  · {new Date(m.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

