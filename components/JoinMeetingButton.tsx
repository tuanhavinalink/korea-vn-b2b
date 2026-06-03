'use client'
import { useState } from 'react'
import { Video } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  eventId: string
  memberId?: string
  initialInterested: boolean
  interestId?: string
}

export default function JoinMeetingButton({ eventId, memberId, initialInterested, interestId }: Props) {
  const [interested, setInterested] = useState(initialInterested)
  const [intId, setIntId] = useState(interestId)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)

    if (!memberId) {
      router.push('/login')
      setLoading(false)
      return
    }

    if (interested && intId) {
      const { error } = await supabase.from('event_interests').delete().eq('id', intId)
      if (!error) { setInterested(false); setIntId(undefined) }
    } else {
      const { data, error } = await supabase
        .from('event_interests')
        .insert({ vn_member_id: memberId, event_id: eventId })
        .select().single()
      if (!error && data) { setInterested(true); setIntId(data.id) }
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all
        ${interested
          ? 'bg-green-600 text-white border-2 border-green-600'
          : 'border-2 border-korean-blue text-korean-blue hover:bg-korean-blue hover:text-white'
        } disabled:opacity-50`}
    >
      <Video size={16} />
      {interested ? 'Interested ✓' : 'JOIN MEETING'}
    </button>
  )
}
