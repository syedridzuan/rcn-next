import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-orange-50 text-gray-600 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-orange-600">Tentang Kami</h3>
            <p className="text-sm">ResepiCheNom adalah platform resipi dalam talian yang menyediakan pelbagai resipi mudah dan lazat untuk semua peringkat umur.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-orange-600">Pautan Pantas</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/tentang-kami" className="text-sm hover:text-orange-600 transition-colors">Tentang Kami</Link>
              <Link href="/hubungi-kami" className="text-sm hover:text-orange-600 transition-colors">Hubungi Kami</Link>
              <Link href="/dasar-privasi" className="text-sm hover:text-orange-600 transition-colors">Dasar Privasi</Link>
              <Link href="/terma-penggunaan" className="text-sm hover:text-orange-600 transition-colors">Terma Penggunaan</Link>
            </nav>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-orange-600">Kategori Popular</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/kategori/sarapan" className="text-sm hover:text-orange-600 transition-colors">Sarapan</Link>
              <Link href="/kategori/makan-tengah-hari" className="text-sm hover:text-orange-600 transition-colors">Makan Tengah Hari</Link>
              <Link href="/kategori/makan-malam" className="text-sm hover:text-orange-600 transition-colors">Makan Malam</Link>
              <Link href="/kategori/pencuci-mulut" className="text-sm hover:text-orange-600 transition-colors">Pencuci Mulut</Link>
            </nav>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-orange-600">Ikuti Kami</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-600 transition-colors">
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-600 transition-colors">
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-600 transition-colors">
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-600 transition-colors">
                <Youtube className="h-6 w-6" />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8">
          <p className="text-center text-sm">
            © 2024 ResepiCheNom. Hakcipta Terpelihara.
          </p>
        </div>
      </div>
    </footer>
  )
}

