'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [profileMenu, setProfileMenu] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase.from('profiles').select('*').eq('id', data.user.id).single()
          .then(({ data: p }) => setProfile(p))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const dashboardLink = profile?.role === 'admin'
    ? '/admin'
    : profile?.role === 'korean'
    ? '/korean/dashboard'
    : '/member/dashboard'

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-korean-red" />
              <div className="w-3 h-3 rounded-full bg-korean-blue" />
            </div>
            <span className="font-bold text-lg text-korean-dark">Korea<span className="text-korean-red">VN</span> B2B</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-korean-red font-medium transition-colors">Companies</Link>
            <Link href="/events" className="text-gray-600 hover:text-korean-red font-medium transition-colors">ZOOM Events</Link>
            {!user && (
              <>
                <Link href="/register" className="text-gray-600 hover:text-korean-red font-medium transition-colors">Register</Link>
                <Link href="/login" className="btn-primary text-sm">Login</Link>
              </>
            )}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setProfileMenu(!profileMenu)}
                  className="flex items-center gap-2 text-gray-700 hover:text-korean-red font-medium"
                >
                  <User size={18} />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                  <ChevronDown size={16} />
                </button>
                {profileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link href={dashboardLink} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                      <User size={16} /> My Dashboard
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          <Link href="/" className="block py-2 text-gray-700 font-medium" onClick={() => setOpen(false)}>Companies</Link>
          <Link href="/events" className="block py-2 text-gray-700 font-medium" onClick={() => setOpen(false)}>ZOOM Events</Link>
          {!user && (
            <>
              <Link href="/register" className="block py-2 text-gray-700 font-medium" onClick={() => setOpen(false)}>Register</Link>
              <Link href="/login" className="block btn-primary text-center" onClick={() => setOpen(false)}>Login</Link>
            </>
          )}
          {user && (
            <>
              <Link href={dashboardLink} className="block py-2 text-gray-700 font-medium" onClick={() => setOpen(false)}>My Dashboard</Link>
              <button onClick={handleLogout} className="block w-full text-left py-2 text-gray-700 font-medium">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
