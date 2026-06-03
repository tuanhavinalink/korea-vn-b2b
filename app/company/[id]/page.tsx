import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import FavoriteButton from '@/components/FavoriteButton'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, FileText, Package } from 'lucide-react'

export const revalidate = 60

function getYouTubeEmbedId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

export default async function CompanyPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const profile = await getCurrentProfile().catch(() => null)

  const [{ data: company }, { data: products }] = await Promise.all([
    supabase.from('korean_companies').select('*').eq('id', params.id).single(),
    supabase.from('products').select('*').eq('company_id', params.id).eq('is_active', true).order('created_at'),
  ])

  if (!company) notFound()

  // Get user's favorites for this company and products
  let companyFav: any = null
  let productFavs: Record<string, any> = {}
  let memberId: string | undefined

  if (profile?.role === 'vn') {
    memberId = profile.id
    const { data: favs } = await supabase
      .from('favorites')
      .select('*')
      .eq('vn_member_id', profile.id)

    favs?.forEach((f: any) => {
      if (f.company_id === company.id) companyFav = f
      if (f.product_id) productFavs[f.product_id] = f
    })
  }

  const embedId = company.video_url ? getYouTubeEmbedId(company.video_url) : null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-korean-red mb-8 text-sm font-medium">
        <ArrowLeft size={16} /> Back to Companies
      </Link>

      {/* Company Header */}
      <div className="card p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Logo */}
          <div className="w-full md:w-48 h-32 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="max-h-24 max-w-full object-contain p-2" />
            ) : (
              <div className="text-4xl font-black text-gray-200">{company.name.slice(0, 2).toUpperCase()}</div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                <span className="inline-block mt-2 text-sm bg-korean-blue/10 text-korean-blue font-medium px-3 py-1 rounded-full">
                  {company.business_sector}
                </span>
              </div>
              <FavoriteButton
                companyId={company.id}
                initialFaved={!!companyFav}
                favoriteId={companyFav?.id}
                memberId={memberId}
                label={companyFav ? 'Loved this company' : 'Love this company'}
              />
            </div>
            {company.description && (
              <p className="mt-4 text-gray-600 leading-relaxed">{company.description}</p>
            )}
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-korean-blue text-sm hover:underline">
                <ExternalLink size={14} /> {company.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Video + Catalog row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* YouTube Video */}
        {embedId && (
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">▶</span> Introduction Video
            </h2>
            <div className="aspect-video rounded-xl overflow-hidden shadow">
              <iframe
                src={`https://www.youtube.com/embed/${embedId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Catalog */}
        {company.catalog_url && (
          <div className={embedId ? '' : 'lg:col-span-3'}>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-korean-red" /> Company Catalog
            </h2>
            <a href={company.catalog_url} target="_blank" rel="noopener noreferrer"
              className="card flex flex-col items-center justify-center p-10 text-center hover:shadow-md transition-all group border-2 border-dashed border-gray-200 hover:border-korean-red">
              <FileText size={48} className="text-gray-300 group-hover:text-korean-red mb-4 transition-colors" />
              <p className="font-semibold text-gray-700 group-hover:text-korean-red transition-colors">View / Download Catalog</p>
              <p className="text-sm text-gray-400 mt-1">Click to open</p>
            </a>
          </div>
        )}
      </div>

      {/* Products */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package size={24} className="text-korean-blue" /> Products & Services
        </h2>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <div key={product.id} className="card hover:shadow-md transition-shadow">
                {/* Product image */}
                {product.image_urls?.length > 0 ? (
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img src={product.image_urls[0]} alt={product.name}
                      className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Package size={40} className="text-gray-300" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3">{product.description}</p>
                  )}
                  <FavoriteButton
                    productId={product.id}
                    initialFaved={!!productFavs[product.id]}
                    favoriteId={productFavs[product.id]?.id}
                    memberId={memberId}
                    label={productFavs[product.id] ? 'Loved' : 'Love Product'}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 card">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>No products listed yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
