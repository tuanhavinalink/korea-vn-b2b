'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const banners = ['/Banner1.jpg', '/Banner2.jpg', '/Banner3.jpg']

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(i => (i + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent(i => (i - 1 + banners.length) % banners.length)
  const next = () => setCurrent(i => (i + 1) % banners.length)

  return (
    <section>
      {/* Slider */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/5', minHeight: 220 }}>
        {banners.map((src, i) => (
          <Link href="/register" key={i} tabIndex={i === current ? 0 : -1}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <img src={src} alt={`Banner ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
          </Link>
        ))}

        {/* Prev / Next arrows */}
        <button onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors">
          <ChevronLeft size={22} />
        </button>
        <button onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors">
          <ChevronRight size={22} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/40'}`} />
          ))}
        </div>
      </div>

      {/* Buttons below slider */}
      <div className="flex flex-wrap justify-center gap-4 py-6 bg-white border-b border-gray-100">
        <Link href="/register"
          className="bg-korean-red hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
          Register as Vietnamese Buyer
        </Link>
        <Link href="#companies"
          className="bg-korean-blue hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
          Browse Companies
        </Link>
      </div>
    </section>
  )
}
