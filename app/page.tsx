export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import HomeClient from '@/components/HomeClient'
import HeroBanner from '@/components/HeroBanner'
import EventPopup from '@/components/EventPopup'
import Link from 'next/link'
import { Calendar, ChevronRight, Star } from 'lucide-react'

async function getCompanies() {
  const supabase = createClient()
  const { data } = await supabase
    .from('korean_companies')
    .select('*')
    .eq('is_active', true)
    .order('name')
  return data ?? []
}

async function getProducts() {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at')
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
  const [companies, products, events] = await Promise.all([
    getCompanies(), getProducts(), getUpcomingEvents()
  ])

  return (
    <>
      {/* Event Popup */}
      <EventPopup
        eventTitle="Korean Vietnamese SME Zoom Matching 2 – 20h, 23/07/2026"
        eventImage="/kasmi2.png"
        eventLink="/events"
      />

      {/* Hero Banner Slider */}
      <HeroBanner />

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

      {/* Companies + Products (client pagination) */}
      <HomeClient companies={companies} products={products} />

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
