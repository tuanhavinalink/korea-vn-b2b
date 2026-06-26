export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import JoinMeetingButton from '@/components/JoinMeetingButton'
import { Calendar, Video, MessageCircle, Clock } from 'lucide-react'

export const revalidate = 60

export default async function EventsPage() {
  const supabase = createClient()
  const profile = await getCurrentProfile().catch(() => null)

  const { data: events } = await supabase
    .from('zoom_events')
    .select('*')
    .eq('is_published', true)
    .order('event_date')

  let interestMap: Record<string, any> = {}
  let memberId: string | undefined

  if (profile?.role === 'vn') {
    memberId = profile.id
    const { data: interests } = await supabase
      .from('event_interests')
      .select('*')
      .eq('vn_member_id', profile.id)
    interests?.forEach((i: any) => { interestMap[i.event_id] = i })
  }

  const now = new Date()
  const upcoming = events?.filter((e: any) => new Date(e.event_date) >= now) ?? []
  const past = events?.filter((e: any) => new Date(e.event_date) < now) ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-korean-blue/10 text-korean-blue px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Video size={16} /> ZOOM Business Meetings
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Scheduled ZOOM Events</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Join business meetings with Korean enterprises. Register your interest and our team will send you the meeting link.
        </p>
      </div>

      {/* Info box */}
      {!profile && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-8 flex items-start gap-3">
          <span className="text-2xl">👋</span>
          <div>
            <p className="font-semibold text-yellow-800">Want to join a meeting?</p>
            <p className="text-yellow-700 text-sm mt-1">
              <a href="/register" className="underline font-medium">Register as a Vietnamese buyer</a> or{' '}
              <a href="/login" className="underline font-medium">login</a> to express your interest in meetings.
            </p>
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
          <Calendar size={20} className="text-korean-red" /> Upcoming Events
        </h2>

        {upcoming.length === 0 ? (
          <div className="text-center py-16 text-gray-400 card">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p>No upcoming events scheduled. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((event: any) => (
              <EventCard key={event.id} event={event}
                interested={!!interestMap[event.id]}
                interestId={interestMap[event.id]?.id}
                memberId={memberId}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-500 mb-5 flex items-center gap-2">
            <Clock size={20} /> Past Events
          </h2>
          <div className="space-y-4 opacity-60">
            {past.map((event: any) => (
              <EventCard key={event.id} event={event} interested={false} memberId={undefined} isPast />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function EventCard({ event, interested, interestId, memberId, isPast }: {
  event: any; interested: boolean; interestId?: string; memberId?: string; isPast?: boolean
}) {
  const date = new Date(event.event_date)

  return (
    <div className="card overflow-hidden">
      {/* Event image banner */}
      {event.image_url && (
        <div className="w-full h-48 overflow-hidden">
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-5 items-start p-6">
        {/* Date block (show only if no image) */}
        {!event.image_url && (
          <div className="bg-korean-blue text-white rounded-xl px-5 py-4 text-center min-w-[80px] flex-shrink-0">
            <div className="text-2xl font-bold">{date.getDate()}</div>
            <div className="text-xs uppercase tracking-wider">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
            <div className="text-xs opacity-75">{date.getFullYear()}</div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              {event.duration_minutes && ` · ${event.duration_minutes} min`}
            </span>
          </div>
          {event.description && <p className="text-gray-600 text-sm mb-4">{event.description}</p>}

          <div className="flex flex-wrap gap-3">
            {!isPast && (
              <JoinMeetingButton
                eventId={event.id}
                memberId={memberId}
                initialInterested={interested}
                interestId={interestId}
              />
            )}
            {!isPast && (event.zoom_link || event.zalo_link) && (
              memberId ? (
                <>
                  {event.zoom_link && (
                    <a href={event.zoom_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#2D8CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                      <Video size={16} /> Open ZOOM
                    </a>
                  )}
                  {event.zalo_link && (
                    <a href={event.zalo_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#0068FF] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                      <MessageCircle size={16} /> Join Zalo Group
                    </a>
                  )}
                </>
              ) : (
                <a href="/register"
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200">
                  🔒 Đăng ký để xem link ZOOM / Zalo
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

