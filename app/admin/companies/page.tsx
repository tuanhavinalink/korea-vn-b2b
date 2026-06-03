import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, Plus, Edit, Eye } from 'lucide-react'

export default async function AdminCompaniesPage() {
  const profile = await getCurrentProfile().catch(() => null)
  if (!profile || profile.role !== 'admin') redirect('/login')

  const supabase = createAdminClient()
  const { data: companies } = await supabase
    .from('korean_companies')
    .select('*, products(count)')
    .order('name')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Korean Companies</h1>
          <p className="text-gray-500 mt-1">Manage company profiles, products and Korean user accounts</p>
        </div>
        <Link href="/admin/companies/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Company
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Company</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Sector</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Video</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Catalog</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Products</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {companies?.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {c.logo_url ? (
                        <img src={c.logo_url} alt="" className="max-h-9 max-w-full object-contain p-1" />
                      ) : (
                        <Building2 size={16} className="text-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{c.name}</p>
                      {c.website && <p className="text-xs text-gray-400">{c.website}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block bg-korean-blue/10 text-korean-blue text-xs px-2 py-1 rounded-full">
                    {c.business_sector}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {c.video_url ? (
                    <span className="text-green-600 text-xs font-medium">✓ Set</span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {c.catalog_url ? (
                    <span className="text-green-600 text-xs font-medium">✓ Set</span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-700">
                  {c.products?.[0]?.count ?? 0}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium
                    ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/company/${c.id}`} target="_blank"
                      className="p-1.5 text-gray-400 hover:text-korean-blue rounded" title="View">
                      <Eye size={16} />
                    </Link>
                    <Link href={`/admin/companies/${c.id}/edit`}
                      className="p-1.5 text-gray-400 hover:text-korean-red rounded" title="Edit">
                      <Edit size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!companies || companies.length === 0) && (
          <div className="text-center py-16 text-gray-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p>No companies yet. <Link href="/admin/companies/new" className="text-korean-blue hover:underline">Add the first one →</Link></p>
          </div>
        )}
      </div>
    </div>
  )
}
