export const dynamic = 'force-dynamic'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

const SECTORS = [
  'Manufacturing', 'Food & Beverage', 'Agriculture', 'Technology & IT',
  'Construction & Real Estate', 'Textile & Garment', 'Chemical & Plastics',
  'Healthcare & Medical', 'Logistics & Shipping', 'Retail & Distribution',
  'Energy & Environment', 'Finance & Investment', 'Steel & Metal',
  'Automotive', 'Electronics', 'Education', 'Other',
]

interface ProductInput { name: string; description: string; image_urls: string }

export default function NewCompanyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Company fields
  const [name, setName] = useState('')
  const [sector, setSector] = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [catalogUrl, setCatalogUrl] = useState('')
  const [website, setWebsite] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  // Korean user login
  const [koreanEmail, setKoreanEmail] = useState('')
  const [koreanPassword, setKoreanPassword] = useState('')

  // Products
  const [products, setProducts] = useState<ProductInput[]>([{ name: '', description: '', image_urls: '' }])

  const addProduct = () => setProducts([...products, { name: '', description: '', image_urls: '' }])
  const removeProduct = (i: number) => setProducts(products.filter((_, idx) => idx !== i))
  const updateProduct = (i: number, field: keyof ProductInput, val: string) => {
    setProducts(products.map((p, idx) => idx === i ? { ...p, [field]: val } : p))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Create company
    const { data: company, error: companyError } = await supabase
      .from('korean_companies')
      .insert({
        name, business_sector: sector, description: description || null,
        logo_url: logoUrl || null, video_url: videoUrl || null,
        catalog_url: catalogUrl || null, website: website || null,
        contact_email: contactEmail || null,
      })
      .select().single()

    if (companyError) { setError(companyError.message); setLoading(false); return }

    // 2. Create Korean user account (via API route to use admin client)
    if (koreanEmail && koreanPassword) {
      const res = await fetch('/api/admin/create-korean-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: koreanEmail, password: koreanPassword, companyId: company.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to create Korean user')
        setLoading(false)
        return
      }
    }

    // 3. Create products
    const validProducts = products.filter(p => p.name.trim())
    if (validProducts.length > 0) {
      const productRows = validProducts.map(p => ({
        company_id: company.id,
        name: p.name,
        description: p.description || null,
        image_urls: p.image_urls ? p.image_urls.split('\n').map(u => u.trim()).filter(Boolean) : [],
      }))
      const { error: prodError } = await supabase.from('products').insert(productRows)
      if (prodError) { setError(prodError.message); setLoading(false); return }
    }

    router.push('/admin/companies')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/admin/companies" className="inline-flex items-center gap-2 text-gray-500 hover:text-korean-red mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Companies
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Korean Company</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Info */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-5 text-lg">Company Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Company Name *</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Samsung C&T" />
            </div>
            <div>
              <label className="label">Business Sector *</label>
              <select className="input" value={sector} onChange={e => setSector(e.target.value)} required>
                <option value="">— Select —</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Logo URL</label>
              <input className="input" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://company.co.kr" />
            </div>
            <div>
              <label className="label">Contact Email</label>
              <input type="email" className="input" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="contact@company.co.kr" />
            </div>
            <div>
              <label className="label">YouTube Video URL</label>
              <input className="input" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Catalog URL (Google Drive / external link)</label>
              <input className="input" value={catalogUrl} onChange={e => setCatalogUrl(e.target.value)} placeholder="https://drive.google.com/..." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Company Description</label>
              <textarea className="input h-24 resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief company overview..." />
            </div>
          </div>
        </div>

        {/* Korean User Account */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-2 text-lg">Korean Company Login Account</h2>
          <p className="text-sm text-gray-500 mb-5">Create login credentials for the Korean company representative</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Login Email</label>
              <input type="email" className="input" value={koreanEmail} onChange={e => setKoreanEmail(e.target.value)} placeholder="rep@company.co.kr" />
            </div>
            <div>
              <label className="label">Temporary Password</label>
              <input type="text" className="input" value={koreanPassword} onChange={e => setKoreanPassword(e.target.value)} placeholder="Min. 8 characters" />
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 text-lg">Products / Services</h2>
            <button type="button" onClick={addProduct}
              className="flex items-center gap-1 text-sm text-korean-blue hover:text-blue-800 font-medium">
              <Plus size={16} /> Add Product
            </button>
          </div>

          <div className="space-y-5">
            {products.map((p, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-600">Product #{i + 1}</span>
                  {products.length > 1 && (
                    <button type="button" onClick={() => removeProduct(i)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Product Name</label>
                    <input className="input" value={p.name} onChange={e => updateProduct(i, 'name', e.target.value)} placeholder="Product name" />
                  </div>
                  <div>
                    <label className="label">Image URLs (one per line)</label>
                    <textarea className="input h-16 resize-none text-xs" value={p.image_urls}
                      onChange={e => updateProduct(i, 'image_urls', e.target.value)}
                      placeholder="https://example.com/img.jpg&#10;https://example.com/img2.jpg" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Description</label>
                    <textarea className="input h-20 resize-none" value={p.description}
                      onChange={e => updateProduct(i, 'description', e.target.value)}
                      placeholder="Product description..." />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full text-center">
          {loading ? 'Creating...' : 'Create Company & Products'}
        </button>
      </form>
    </div>
  )
}

