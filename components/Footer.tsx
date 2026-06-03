import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-korean-dark text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-korean-red" />
                <div className="w-3 h-3 rounded-full bg-korean-blue" />
              </div>
              <span className="font-bold text-white text-lg">KoreaVN B2B</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The premier B2B trade platform connecting Korean enterprises with Vietnamese business partners.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Korean Companies</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">ZOOM Events</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Register as Buyer</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">For Korean Companies</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">Contact the organizer to list your company</li>
              <li><Link href="/login" className="hover:text-white transition-colors">Korean Company Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} Korea-Vietnam B2B Trade Platform. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
