import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import Link from 'next/link'
import { Heart, Calendar, Building2, Package, User } from 'lucide-react'

export default async function MemberDashboard() {
  const profile = await getCurrentProfile().catch(() => null)
  if (!profile || profile.role !== 'vn') redirect('/login')

  const supabase = createClient()

  const [{ data: member }, { data: favorites }, { data: interests }] = await Promise.all([
    supabase.from('vn_members').select('*').eq('id', profile.id).single(),
    supabase.from('favorites').select(`
      *,
      korean_companies(id, name, business_sector, logo_url),
      products(id, name, company_id, korean_companies(name))
    `).eq('vn_member_id', profile.id).order('created_at', { ascending: false }),
    supabase.from('event_interests').select(`
      *, zoom_events(*)
    `).eq('vn_member_id', profile.id).order('created_at', { ascending: false }),
  ])

  const companyFavs = favorites?.filter((f: any) => f.company_id && f.korean_companies) ?? []
  const productFavs = favorites?.filter((f: any) => f.product_id && f.products) ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="card p-6 mb-8 bg-gradient-to-r from-korean-blue to-blue-700 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{member?.full_name}</h1>
            <p className="opacity-80 text-sm">
              {member?.company_name && `${member.company_name} · `}
              {member?.position}
            </p>
            <p className="opacity-70 text-xs mt-0.5">{member?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold">{companyFavs.length}</div>
            <div className="text-xs opacity-70">Companies Loved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{productFavs.length}</div>
            <div className="text-xs opacity-70">Products Loved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{interests?.length ?? 0}</div>
            <div className="text-xs opacity-70">Events Interested</div>
          </div>
        </div>
      </div>

      {/* Favorite Companies */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Heart size={20} className="text-korean-red fill-korean-red" /> Favorite Companies
        </h2>
        {companyFavs.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <Building2 size={36} className="mx-auto mb-2 opacity-30" />
            <p>No companies loved yet. <Link href="/" className="text-korean-blue hover:underline">Browse companies →</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {companyFavs.map((fav: any) => (
              <Link key={fav.id} href={`/company/${fav.company_id}`}
                className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {fav.korean_companies?.logo_url ? (
                    <img src={fav.korean_companies.logo_url} alt="" className="max-h-10 max-w-full object-contain p-1" />
                  ) : (
                    <Building2 size={20} className="text-gray-300" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{fav.korean_companies?.name}</p>
                  <p className="text-xs text-gray-400">{fav.korean_companies?.business_sector}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Favorite Products */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Package size={20} className="text-korean-blue" /> Favorite Products
        </h2>
        {productFavs.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <Package size={36} className="mx-auto mb-2 opacity-30" />
            <p>No products loved yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {productFavs.map((fav: any) => (
              <div key={fav.id} className="card p-5">
                <p className="font-semibold text-gray-900">{fav.products?.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  by {fav.products?.korean_companies?.name}
                </p>
                <p className="text-xs text-gray-300 mt-1">{new Date(fav.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interested Events */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Calendar size={20} className="text-green-600" /> ZOOM Events I'm Interested In
        </h2>
        {!interests || interests.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <Calendar size={36} className="mx-auto mb-2 opacity-30" />
            <p>No events joined yet. <Link href="/events" className="text-korean-blue hover:underline">Browse events →</Link></p>
          </div>
        ) : (
          <div className="space-y-3">
            {interests.map((interest: any) => {
              const ev = interest.zoom_events
              if (!ev) return null
              return (
                <div key={interest.id} className="card p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{ev.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(ev.event_date).toLocaleDateString('en-US', {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {ev.zoom_link && (
                      <a href={ev.zoom_link} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-[#2D8CFF] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-600">
                        ZOOM
                      </a>
                    )}
                    {ev.zalo_link && (
                      <a href={ev.zalo_link} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-[#0068FF] text-white px-3 py-1.5 rounded-lg font-medium">
                        Zalo
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
