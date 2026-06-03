export const dynamic = 'force-dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { KoreanCompany } from '@/types'
import { Building2, Calendar, Star, ChevronRight } from 'lucide-react'

export const revalidate = 60

async function getCompanies(): Promise<KoreanCompany[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('korean_companies')
    .select('*')
    .eq('is_active', true)
    .order('name')
  return data ?? []
}

async function getUpcomingEvents() {
  const supabase = createClient()
  const { data } = await supabase
    .from('zoom_events')
    .select('*')
    .eq('is_published', true)
    .gte('event_date', new Date().toISOString())
    .order('event_date')
    .limit(3)
  return data ?? []
}

export default async function HomePage() {
  const [companies, events] = await Promise.all([getCompanies(), getUpcomingEvents()])

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-korean-dark via-korean-blue to-korean-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-3 mb-6">
            <span className="text-5xl">🇰🇷</span>
            <span className="text-5xl">🤝</span>
            <span className="text-5xl">🇻🇳</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Korea – Vietnam<br />
            <span className="text-yellow-400">B2B Trade Platform</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover leading Korean enterprises, explore their products & catalogs,
            and connect through live ZOOM business meetings.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="bg-korean-red hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Register as Vietnamese Buyer
            </Link>
            <Link href="#companies" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-lg transition-colors backdrop-blur">
              Browse Companies
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-korean-red">{companies.length}+</div>
              <div className="text-sm text-gray-500 mt-1">Korean Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-korean-blue">{events.length}</div>
              <div className="text-sm text-gray-500 mt-1">Upcoming Events</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-700">B2B</div>
              <div className="text-sm text-gray-500 mt-1">Direct Connect</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming ZOOM Events banner */}
      {events.length > 0 && (
        <section className="bg-yellow-50 border-y border-yellow-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-yellow-700 font-semibold">
                <Calendar size={18} />
                <span>Upcoming ZOOM Events:</span>
              </div>
              {events.map((ev: any) => (
                <Link key={ev.id} href="/events"
                  className="bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors flex items-center gap-1">
                  {ev.title} — {new Date(ev.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  <ChevronRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Company Grid */}
      <section id="companies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="section-title">Korean Partner Companies</h2>
            <p className="text-gray-500 mt-2">Click on a company to view their products, catalog and introduction video</p>
          </div>
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Building2 size={48} className="mx-auto mb-4 opacity-30" />
            <p>No companies listed yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-korean-blue text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Star size={40} className="mx-auto mb-4 text-yellow-400" />
          <h2 className="text-3xl font-bold mb-4">Ready to Find Korean Partners?</h2>
          <p className="text-blue-100 mb-8">
            Register as a Vietnamese buyer to save your favorite companies,
            express interest in ZOOM meetings, and connect with Korean enterprises.
          </p>
          <Link href="/register" className="bg-white text-korean-blue font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-block">
            Register for Free
          </Link>
        </div>
      </section>
    </>
  )
}

function CompanyCard({ company }: { company: KoreanCompany }) {
  return (
    <Link href={`/company/${company.id}`}
      className="card hover:shadow-md transition-all hover:-translate-y-1 group">
      <div className="p-6">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center bg-gray-50 rounded-lg mb-4 overflow-hidden">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name}
              className="max-h-16 max-w-full object-contain" />
          ) : (
            <div className="text-3xl font-bold text-gray-200">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        {/* Info */}
        <h3 className="font-bold text-lg text-gray-900 group-hover:text-korean-red transition-colors mb-1">
          {company.name}
        </h3>
        <span className="inline-block text-xs bg-korean-blue/10 text-korean-blue font-medium px-2 py-1 rounded-full mb-3">
          {company.business_sector}
        </span>
        {company.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{company.description}</p>
        )}
        <div className="mt-4 flex items-center text-korean-red text-sm font-medium">
          View Showroom <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

