export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth'
import { Heart, Package, Building2, Users } from 'lucide-react'

export default async function KoreanDashboard() {
  const profile = await getCurrentProfile().catch(() => null)
  if (!profile || profile.role !== 'korean') redirect('/login')

  const supabase = createClient()

  // Get the company linked to this Korean user
  const { data: company } = await supabase
    .from('korean_companies')
    .select('*')
    .eq('id', profile.company_id!)
    .single()

  if (!company) redirect('/')

  // Favorites for this company (who loved the company)
  const { data: companyFavs } = await supabase
    .from('favorites')
    .select('id, created_at, vn_member_id')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  // Favorites for products of this company
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('company_id', company.id)

  const productIds = products?.map((p: any) => p.id) ?? []
  let productFavs: any[] = []
  if (productIds.length > 0) {
    const { data } = await supabase
      .from('favorites')
      .select('id, product_id, created_at, vn_member_id')
      .in('product_id', productIds)
      .order('created_at', { ascending: false })
    productFavs = data ?? []
  }

  // Count unique VN users interested in company or products
  const allVnIds = new Set([
    ...(companyFavs?.map((f: any) => f.vn_member_id) ?? []),
    ...productFavs.map((f: any) => f.vn_member_id),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="card p-6 mb-8 bg-gradient-to-r from-korean-red to-red-700 text-white">
        <div className="flex items-center gap-4">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="h-14 bg-white rounded-lg p-1 object-contain" />
          ) : (
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Building2 size={28} />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="opacity-80 text-sm">{company.business_sector}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold">{allVnIds.size}</div>
            <div className="text-xs opacity-70">Vietnamese Buyers Interested</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{companyFavs?.length ?? 0}</div>
            <div className="text-xs opacity-70">Company Loves</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{productFavs.length}</div>
            <div className="text-xs opacity-70">Product Loves</div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-700">
        <strong>Privacy Note:</strong> You can see how many Vietnamese buyers are interested in your company and products.
        Detailed buyer contact information is only accessible to the event organizer (admin).
      </div>

      {/* Who loved your company */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Heart size={20} className="text-korean-red fill-korean-red" />
          Vietnamese Buyers Who Loved Your Company
          <span className="ml-2 bg-korean-red text-white text-xs px-2 py-0.5 rounded-full">{companyFavs?.length ?? 0}</span>
        </h2>

        {!companyFavs || companyFavs.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <Heart size={36} className="mx-auto mb-2 opacity-30" />
            <p>No one has loved your company yet. Share your page!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {companyFavs.map((fav: any, i: number) => (
              <div key={fav.id} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-korean-red/10 flex items-center justify-center text-korean-red font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">Vietnamese Buyer</p>
                  <p className="text-xs text-gray-400">{new Date(fav.created_at).toLocaleDateString()}</p>
                </div>
                <Heart size={14} className="ml-auto text-korean-red fill-korean-red opacity-40" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Product loves */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Package size={20} className="text-korean-blue" />
          Product Interest Summary
        </h2>

        {products && products.length > 0 ? (
          <div className="space-y-3">
            {products.map((product: any) => {
              const count = productFavs.filter((f: any) => f.product_id === product.id).length
              return (
                <div key={product.id} className="card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package size={18} className="text-gray-300" />
                    <span className="font-medium text-gray-800">{product.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-korean-red font-bold">
                    <Heart size={16} fill="currentColor" />
                    <span>{count}</span>
                    <span className="text-xs text-gray-400 font-normal">loves</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card p-8 text-center text-gray-400">
            <Package size={36} className="mx-auto mb-2 opacity-30" />
            <p>No products listed yet. Contact the admin to add products.</p>
          </div>
        )}
      </section>
    </div>
  )
}

