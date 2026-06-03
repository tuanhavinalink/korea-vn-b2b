'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Plus, Trash2, Eye, EyeOff, Users, Video, MessageCircle } from 'lucide-react'

interface ZoomEvent {
  id: string; title: string; description: string | null; event_date: string;
  duration_minutes: number; zoom_link: string | null; zalo_link: string | null; is_published: boolean;
}

export default function AdminEventsPage() {
  const supabase = createClient()
  const [events, setEvents] = useState<ZoomEvent[]>([])
  const [interestCounts, setInterestCounts] = useState<Record<string, number>>({})
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', event_date: '', duration_minutes: '60',
    zoom_link: '', zalo_link: '', is_published: true,
  })

  const load = async () => {
    const { data } = await supabase.from('zoom_events').select('*').order('event_date', { ascending: false })
    setEvents(data ?? [])

    const { data: interests } = await supabase.from('event_interests').select('event_id')
    const map: Record<string, number> = {}
    interests?.forEach((i: any) => { map[i.event_id] = (map[i.event_id] ?? 0) + 1 })
    setInterestCounts(map)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('zoom_events').insert({
      title: form.title, description: form.description || null,
      event_date: new Date(form.event_date).toISOString(),
      duration_minutes: parseInt(form.duration_minutes),
      zoom_link: form.zoom_link || null, zalo_link: form.zalo_link || null,
      is_published: form.is_published,
    })
    setForm({ title: '', description: '', event_date: '', duration_minutes: '60', zoom_link: '', zalo_link: '', is_published: true })
    setShowForm(false)
    setLoading(false)
    load()
  }

  const togglePublish = async (event: ZoomEvent) => {
    await supabase.from('zoom_events').update({ is_published: !event.is_published }).eq('id', event.id)
    load()
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return
    await supabase.from('zoom_events').delete().eq('id', id)
    load()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ZOOM Events</h1>
          <p className="text-gray-500 mt-1">Create and manage business meeting schedules</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Event
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-8">
          <h2 className="font-bold text-gray-900 mb-5 text-lg">Create New ZOOM Event</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="label">Event Title *</label>
              <input className="input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Korea-Vietnam Business Matching Session #1" />
            </div>
            <div>
              <label className="label">Date & Time *</label>
              <input type="datetime-local" className="input" required value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
            </div>
            <div>
              <label className="label">Duration (minutes)</label>
              <input type="number" className="input" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} />
            </div>
            <div>
              <label className="label">ZOOM Meeting Link</label>
              <input className="input" value={form.zoom_link} onChange={e => setForm({ ...form, zoom_link: e.target.value })} placeholder="https://zoom.us/j/..." />
            </div>
            <div>
              <label className="label">Zalo Group Link</label>
              <input className="input" value={form.zalo_link} onChange={e => setForm({ ...form, zalo_link: e.target.value })} placeholder="https://zalo.me/g/..." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="input h-24 resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Meeting agenda and details..." />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input type="checkbox" id="published" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="published" className="text-sm font-medium text-gray-700">Publish immediately (visible to public)</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create Event'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {/* Events list */}
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="card p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${event.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {event.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {event.duration_minutes && ` · ${event.duration_minutes} min`}
                </p>
                {event.description && <p className="text-sm text-gray-600 mb-3">{event.description}</p>}

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="flex items-center gap-1.5 bg-korean-red/10 text-korean-red text-xs px-3 py-1.5 rounded-full font-medium">
                    <Users size={12} /> {interestCounts[event.id] ?? 0} interested
                  </span>
                  {event.zoom_link && (
                    <a href={event.zoom_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs bg-[#2D8CFF] text-white px-3 py-1.5 rounded-full font-medium">
                      <Video size={12} /> ZOOM
                    </a>
                  )}
                  {event.zalo_link && (
                    <a href={event.zalo_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs bg-[#0068FF] text-white px-3 py-1.5 rounded-full font-medium">
                      <MessageCircle size={12} /> Zalo
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => togglePublish(event)} title={event.is_published ? 'Unpublish' : 'Publish'}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-korean-blue hover:border-korean-blue transition-colors">
                  {event.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={() => deleteEvent(event.id)} title="Delete"
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-16 text-gray-400 card">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p>No events yet. Create the first one.</p>
          </div>
        )}
      </div>
    </div>
  )
}

