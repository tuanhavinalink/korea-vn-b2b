import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-korean-dark text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/kasmi-logo.png" alt="Kasmi" className="h-8 w-auto" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-3">
              한국 기업과 베트남 비지니스 파트너를 연결하는 최고의 b2b 무역 플랫폼입니다
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><span className="text-gray-400 font-medium">공식 운영사:</span> 선행글로벌 (SUNHAENG VIET NAM)</p>
              <p><span className="text-gray-400 font-medium">사업자:</span> 0111395233 &nbsp;|&nbsp; <span className="text-gray-400 font-medium">대표:</span> 권보성 (Kwon Boseong)</p>
            </div>
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
            <h3 className="font-semibold text-white mb-4">연락처 / Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📞 <a href="tel:0394110811" className="hover:text-white transition-colors">0394110811</a></li>
              <li>✉️ <a href="mailto:Shglobalvn99@gmail.com" className="hover:text-white transition-colors">Shglobalvn99@gmail.com</a></li>
              <li>📍 95 TT4, Mỹ Đình, Từ Liêm, Hà Nội, Việt Nam</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} 선행글로벌 (SUNHAENG VIET NAM). All rights reserved.
        </div>
      </div>
    </footer>
  )
}
