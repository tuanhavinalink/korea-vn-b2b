'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Building2, ChevronRight, ChevronLeft, Package } from 'lucide-react'

const PAGE_SIZE = 6

export default function HomeClient({ companies, products }: { companies: any[], products: any[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(companies.length / PAGE_SIZE)
  const pageCompanies = companies.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const pageCompanyIds = new Set(pageCompanies.map((c: any) => c.id))
  const pageProducts = products.filter((p: any) => pageCompanyIds.has(p.company_id))

  return (
    <section id="companies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="section-title">Korean Partner Companies</h2>
          <p className="text-gray-500 mt-2">Click on a company to view their products, catalog and introduction video</p>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Page {page + 1} / {totalPages}</span>
          </div>
        )}
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Building2 size={48} className="mx-auto mb-4 opacity-30" />
          <p>No companies listed yet. Check back soon.</p>
        </div>
      ) : (
        <>
          {/* Company Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageCompanies.map((company: any) => (
              <Link key={company.id} href={`/company/${company.id}`}
                className="card hover:shadow-md transition-all hover:-translate-y-1 group">
                <div className="p-6">
                  <div className="h-20 flex items-center justify-center bg-gray-50 rounded-lg mb-4 overflow-hidden">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.name}
                        className="max-h-16 max-w-full object-contain" />
                    ) : (
                      <div className="text-3xl font-bold text-gray-200">
                        {company.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-korean-red transition-colors mb-1">
                    {company.name}
                  </h3>
                  <span className="inline-block text-xs bg-korean-blue/10 text-korean-blue font-medium px-2 py-1 rounded-full mb-3">
                    {company.business_sector}
                  </span>
                  {company.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{company.description}</p>
                  )}
                  <div className="mt-4 flex items-center text-korean-red text-sm font-medium">
                    View Showroom <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                      i === page
                        ? 'bg-korean-red text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Products of current page companies */}
          {pageProducts.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-3 mb-8">
                <Package size={24} className="text-korean-blue" />
                <h2 className="section-title mb-0">Featured Products</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageProducts.map((product: any) => {
                  const company = pageCompanies.find((c: any) => c.id === product.company_id)
                  return (
                    <Link key={product.id} href={`/company/${product.company_id}`}
                      className="card hover:shadow-md transition-all hover:-translate-y-1 group overflow-hidden">
                      {/* Product image */}
                      {product.image_urls?.[0] ? (
                        <div className="h-48 overflow-hidden bg-gray-100">
                          <img src={product.image_urls[0]} alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Package size={40} className="text-gray-300" />
                        </div>
                      )}
                      <div className="p-5">
                        <p className="text-xs text-korean-blue font-medium mb-1">{company?.name}</p>
                        <h3 className="font-bold text-gray-900 group-hover:text-korean-red transition-colors mb-2">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
