'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

const SECTORS = [
  'Manufacturing', 'Food & Beverage', 'Agriculture', 'Technology & IT',
  'Construction & Real Estate', 'Textile & Garment', 'Chemical & Plastics',
  'Healthcare & Medical', 'Logistics & Shipping', 'Retail & Distribution',
  'Energy & Environment', 'Finance & Investment', 'Education', 'Other',
]

interface FormData {
  full_name: string
  company_name: string
  position: string
  phone: string
  email: string
  password: string
  website: string
  business_sector: string
  partnership_needs: string
}

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')

    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { role: 'vn' },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      setError('Registration failed. Please try again.')
      setLoading(false)
      return
    }

    // 2. Insert VN member profile via API (bypasses RLS for new users without session)
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: authData.user.id,
        full_name: data.full_name,
        company_name: data.company_name || null,
        position: data.position || null,
        phone: data.phone || null,
        email: data.email,
        website: data.website || null,
        business_sector: data.business_sector || null,
        partnership_needs: data.partnership_needs || null,
      }),
    })
    const result = await res.json()
    if (!res.ok) {
      setError(result.error || 'Failed to save profile')
      setLoading(false)
      return
    }

    // 3. Auto sign in after registration
    await supabase.auth.signInWithPassword({ email: data.email, password: data.password })
    window.location.href = '/member/dashboard'
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="card p-10 text-center max-w-md w-full">
          <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-500 mb-6">Please check your email to confirm your account, then log in.</p>
          <Link href="/login" className="btn-primary inline-block">Go to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Register as Vietnamese Buyer</h1>
            <p className="text-gray-500 mt-2">Join the Korea-Vietnam B2B platform to connect with Korean enterprises</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="label">Full Name *</label>
                <input className="input" placeholder="Nguyen Van A"
                  {...register('full_name', { required: 'Full name is required' })} />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
              </div>

              {/* Company */}
              <div>
                <label className="label">Company Name</label>
                <input className="input" placeholder="ABC Trading Co., Ltd"
                  {...register('company_name')} />
              </div>

              {/* Position */}
              <div>
                <label className="label">Position / Title</label>
                <input className="input" placeholder="Director, Manager..."
                  {...register('position')} />
              </div>

              {/* Phone */}
              <div>
                <label className="label">Phone Number</label>
                <input className="input" placeholder="+84 xxx xxx xxx"
                  {...register('phone')} />
              </div>

              {/* Email */}
              <div>
                <label className="label">Email *</label>
                <input type="email" className="input" placeholder="you@company.com"
                  {...register('email', { required: 'Email is required' })} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="label">Password *</label>
                <input type="password" className="input" placeholder="Min. 8 characters"
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Website */}
              <div>
                <label className="label">Website</label>
                <input className="input" placeholder="https://yourcompany.com"
                  {...register('website')} />
              </div>

              {/* Business Sector */}
              <div>
                <label className="label">Business Sector</label>
                <select className="input" {...register('business_sector')}>
                  <option value="">— Select sector —</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Partnership Needs */}
            <div>
              <label className="label">Partnership Needs / What are you looking for?</label>
              <textarea className="input h-28 resize-none"
                placeholder="Describe what type of Korean partners or products you are looking for..."
                {...register('partnership_needs')} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-center">
              {loading ? 'Registering...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account? <Link href="/login" className="text-korean-blue hover:underline font-medium">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
