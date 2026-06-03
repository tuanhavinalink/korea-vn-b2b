'use client'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  companyId?: string
  productId?: string
  initialFaved: boolean
  favoriteId?: string
  memberId?: string
  label?: string
}

export default function FavoriteButton({ companyId, productId, initialFaved, favoriteId, memberId, label }: Props) {
  const [faved, setFaved] = useState(initialFaved)
  const [favId, setFavId] = useState(favoriteId)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)

    if (!memberId) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      setLoading(false)
      return
    }

    if (faved && favId) {
      const { error } = await supabase.from('favorites').delete().eq('id', favId)
      if (!error) { setFaved(false); setFavId(undefined) }
    } else {
      const payload: any = { vn_member_id: memberId }
      if (companyId) payload.company_id = companyId
      if (productId) payload.product_id = productId
      const { data, error } = await supabase.from('favorites').insert(payload).select().single()
      if (!error && data) { setFaved(true); setFavId(data.id) }
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={faved ? 'Remove from favorites' : 'Add to favorites'}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all
        ${faved
          ? 'bg-korean-red border-korean-red text-white'
          : 'border-korean-red text-korean-red hover:bg-korean-red hover:text-white'
        } disabled:opacity-50`}
    >
      <Heart size={16} fill={faved ? 'currentColor' : 'none'} />
      {label ?? (faved ? 'Loved' : 'Love')}
    </button>
  )
}
