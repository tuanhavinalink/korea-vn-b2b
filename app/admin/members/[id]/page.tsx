export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, Calendar, Building2, Package, User, Mail, Phone, Globe } from 'lucide-react'

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
  const profile = await getCurrentProfile().catch(() => null)
  if (!profile || profile.role !== 'admin') redirect('/login')

  const supabase = createClient()

  const [{ data: member }, { data: favorites }, { data: interests }] = await Promise.all([
    supabase.from('vn_members').select('*').eq('id', params.id).single(),
    supabase.from('favorites').select(`
      *,
      korean_companies(id, name, business_sector, logo_url),
      products(id, name, description, korean_companies(name))
    `).eq('vn_member_id', params.id).order('created_at', { ascending: false }),
    supabase.from('event_interests').select(`
      *, zoom_events(id, title, event_date, zoom_link, zalo_link)
    `).eq('vn_member_id', params.id).order('created_at', { ascending: false }),
  ])

  if (!member) redirect('/admin/members')

  const companyFavs = favorites?.filter((f: any) => f.company_id && f.korean_companies) ?? []
  const productFavs = favorites?.filter((f: any) => f.product_id && f.products) ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/admin/members" className="inline-flex items-center gap-2 text-gray-500 hover:text-korean-red mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Members
      </Link>

      {/* Member Info */}
      <div className="card p-6 mb-8 bg-gradient-to-r from-korean-blue to-blue-700 text-white">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={32} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{member.full_name}</h1>
            <p className="opacity-80 text-sm mb-3">
              {member.company_name && `${member.company_name}`}
              {member.position && ` · ${member.position}`}
              {member.business_sector && ` · ${member.business_sector}`}
            </p>
            <div className="flex flex-wrap gap-4 text-sm opacity-90">
              {member.email && (
                <a href={`mailto:${member.email}`} className="flex items-center gap-1 hover:opacity-75">
                  <Mail size={14} /> {member.email}
                </a>
              )}
              {member.phone && (
                <a href={`tel:${member.phone}`} className="flex items-center gap-1 hover:opacity-75">
                  <Phone size={14} /> {member.phone}
                </a>
              )}
              {member.website && (
                <a href={member.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:opacity-75">
                  <Globe size={14} /> {member.website}
                </a>
              )}
            </div>
          </div>
          <div className="text-right text-sm opacity-75">
            Joined {new Date(member.created_at).toLocaleDateString('en-GB')}
          </div>
        </div>
        {member.partnership_needs && (
          <div className="mt-4 bg-white/10 rounded-lg p-3 text-sm">
            <span className="font-semibold">Partnership needs: </span>{member.partnership_needs}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-korean-red">{companyFavs.length}</div>
          <div className="text-sm text-gray-500 mt-1">Saved Companies</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-korean-blue">{productFavs.length}</div>
          <div className="text-sm text-gray-500 mt-1">Saved Products</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-gray-700">{interests?.length ?? 0}</div>
          <div className="text-sm text-gray-500 mt-1">Event Interests</div>
        </div>
      </div>

      {/* Saved Companies */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 size={20} className="text-korean-red" /> Saved Companies ({companyFavs.length})
        </h2>
        {companyFavs.length === 0 ? (
          <div className="card p-6 text-center text-gray-400 text-sm">No saved companies yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {companyFavs.map((f: any) => (
              <Link key={f.id} href={`/company/${f.company_id}`} target="_blank"
                className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                {f.korean_companies.logo_url ? (
                  <img src={f.korean_companies.logo_url} alt={f.korean_companies.name}
                    className="w-10 h-10 object-contain rounded" />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-400">
                    {f.korean_companies.name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{f.korean_companies.name}</div>
                  <div className="text-xs text-gray-500">{f.korean_companies.business_sector}</div>
                </div>
                <Heart size={14} className="ml-auto text-korean-red fill-korean-red" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Saved Products */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={20} className="text-korean-blue" /> Saved Products ({productFavs.length})
        </h2>
        {productFavs.length === 0 ? (
          <div className="card p-6 text-center text-gray-400 text-sm">No saved products yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {productFavs.map((f: any) => (
              <Link key={f.id} href={`/company/${f.products.company_id}`} target="_blank"
                className="card p-4 hover:shadow-md transition-shadow">
                <div className="font-semibold text-gray-900 text-sm">{f.products.name}</div>
                <div className="text-xs text-korean-blue mt-1">{f.products.korean_companies?.name}</div>
                {f.products.description && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{f.products.description}</div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Event Interests */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-green-600" /> Event Interests ({interests?.length ?? 0})
        </h2>
        {!interests || interests.length === 0 ? (
          <div className="card p-6 text-center text-gray-400 text-sm">No event interests yet</div>
        ) : (
          <div className="space-y-3">
            {interests.map((i: any) => (
              <div key={i.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-gray-900">{i.zoom_events?.title}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {i.zoom_events?.event_date && new Date(i.zoom_events.event_date).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {i.zoom_events?.zoom_link && (
                      <a href={i.zoom_events.zoom_link} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-[#2D8CFF] text-white px-3 py-1 rounded-full font-medium hover:opacity-90">
                        ZOOM
                      </a>
                    )}
                    {i.zoom_events?.zalo_link && (
                      <a href={i.zoom_events.zalo_link} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-[#0068FF] text-white px-3 py-1 rounded-full font-medium hover:opacity-90">
                        Zalo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
