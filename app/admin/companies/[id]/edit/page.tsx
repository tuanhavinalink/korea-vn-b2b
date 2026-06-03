'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'

const SECTORS = [
  'Manufacturing', 'Food & Beverage', 'Agriculture', 'Technology & IT',
  'Construction & Real Estate', 'Textile & Garment', 'Chemical & Plastics',
  'Healthcare & Medical', 'Logistics & Shipping', 'Retail & Distribution',
  'Energy & Environment', 'Finance & Investment', 'Steel & Metal',
  'Automotive', 'Electronics', 'Education', 'Other',
]

export default function EditCompanyPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const id = params.id as string

  const [company, setCompany] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('korean_companies').select('*').eq('id', id).single().then(({ data }) => setCompany(data))
    supabase.from('products').select('*').eq('company_id', id).order('created_at').then(({ data }) => {
      setProducts((data ?? []).map((p: any) => ({ ...p, image_urls_text: p.image_urls?.join('\n') ?? '' })))
    })
  }, [id])

  const updateField = (field: string, val: any) => setCompany({ ...company, [field]: val })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: compErr } = await supabase.from('korean_companies').update({
      name: company.name, business_sector: company.business_sector,
      description: company.description, logo_url: company.logo_url,
      video_url: company.video_url, catalog_url: company.catalog_url,
      website: company.website, contact_email: company.contact_email,
      is_active: company.is_active,
    }).eq('id', id)

    if (compErr) { setError(compErr.message); setLoading(false); return }

    // Upsert products
    for (const p of products) {
      const imageUrls = (p.image_urls_text ?? '').split('\n').map((u: string) => u.trim()).filter(Boolean)
      if (p.id && !p.isNew) {
        await supabase.from('products').update({ name: p.name, description: p.description, image_urls: imageUrls }).eq('id', p.id)
      } else if (p.name?.trim()) {
        await supabase.from('products').insert({ company_id: id, name: p.name, description: p.description, image_urls: imageUrls })
      }
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Delete product?')) return
    await supabase.from('products').delete().eq('id', productId)
    setProducts(products.filter(p => p.id !== productId))
  }

  const addProduct = () => setProducts([...products, { isNew: true, name: '', description: '', image_urls_text: '' }])

  if (!company) return <div className="p-10 text-center text-gray-400">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/admin/companies" className="inline-flex items-center gap-2 text-gray-500 hover:text-korean-red mb-6 text-sm">
        <ArrowLeft size={16} /> Back
      </Link>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit: {company.name}</h1>
        <Link href={`/company/${id}`} target="_blank" className="text-sm text-korean-blue hover:underline">View Public Page →</Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}
      {saved && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">✓ Saved successfully!</div>}

      <form onSubmit={handleSave} className="space-y-8">
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-5">Company Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Company Name *</label>
              <input className="input" value={company.name} onChange={e => updateField('name', e.target.value)} required />
            </div>
            <div>
              <label className="label">Business Sector *</label>
              <select className="input" value={company.business_sector} onChange={e => updateField('business_sector', e.target.value)} required>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Logo URL</label>
              <input className="input" value={company.logo_url ?? ''} onChange={e => updateField('logo_url', e.target.value)} />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input" value={company.website ?? ''} onChange={e => updateField('website', e.target.value)} />
            </div>
            <div>
              <label className="label">Contact Email</label>
              <input type="email" className="input" value={company.contact_email ?? ''} onChange={e => updateField('contact_email', e.target.value)} />
            </div>
            <div>
              <label className="label">YouTube Video URL</label>
              <input className="input" value={company.video_url ?? ''} onChange={e => updateField('video_url', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Catalog URL</label>
              <input className="input" value={company.catalog_url ?? ''} onChange={e => updateField('catalog_url', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="input h-24 resize-none" value={company.description ?? ''} onChange={e => updateField('description', e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="active" checked={company.is_active} onChange={e => updateField('is_active', e.target.checked)} className="w-4 h-4" />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">Visible to public</label>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Products</h2>
            <button type="button" onClick={addProduct} className="flex items-center gap-1 text-sm text-korean-blue hover:text-blue-800 font-medium">
              <Plus size={16} /> Add
            </button>
          </div>
          <div className="space-y-4">
            {products.map((p, i) => (
              <div key={p.id ?? i} className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500">Product #{i + 1}</span>
                  <button type="button" onClick={() => p.id && !p.isNew ? deleteProduct(p.id) : setProducts(products.filter((_, j) => j !== i))}
                    className="text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Name</label>
                    <input className="input" value={p.name} onChange={e => setProducts(products.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                  </div>
                  <div>
                    <label className="label">Image URLs (one per line)</label>
                    <textarea className="input h-16 resize-none text-xs" value={p.image_urls_text}
                      onChange={e => setProducts(products.map((x, j) => j === i ? { ...x, image_urls_text: e.target.value } : x))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Description</label>
                    <textarea className="input h-20 resize-none" value={p.description ?? ''}
                      onChange={e => setProducts(products.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
