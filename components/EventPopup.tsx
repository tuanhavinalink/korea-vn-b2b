'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

interface EventPopupProps {
  eventTitle: string
  eventImage: string
  eventLink: string
}

export default function EventPopup({ eventTitle, eventImage, eventLink }: EventPopupProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show popup after 1s, only once per session
    const dismissed = sessionStorage.getItem('popup_dismissed')
    if (!dismissed) {
      const t = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(t)
    }
  }, [])

  const close = () => {
    setVisible(false)
    sessionStorage.setItem('popup_dismissed', '1')
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={close}>
      <div className="relative max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={close}
          className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors">
          <X size={18} />
        </button>

        {/* Image */}
        <Link href={eventLink} onClick={close}>
          <img src={eventImage} alt={eventTitle} className="w-full object-cover cursor-pointer" />
        </Link>

        {/* CTA bar */}
        <div className="bg-korean-dark text-white px-6 py-4 flex items-center justify-between gap-4">
          <p className="font-semibold text-sm leading-snug">{eventTitle}</p>
          <Link href={eventLink} onClick={close}
            className="flex-shrink-0 bg-korean-red hover:bg-red-700 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  )
}
