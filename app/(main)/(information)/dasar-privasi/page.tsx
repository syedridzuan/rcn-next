import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dasar Privasi - ResepiCheNom",
  description: "Dasar privasi ResepiCheNom mengenai penggunaan dan perlindungan data peribadi anda.",
}

export default function DasarPrivasiPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Dasar Privasi</h1>
      
      <div className="prose prose-orange lg:prose-lg">
        <p>
          Dasar privasi ini menerangkan bagaimana ResepiCheNom mengumpul, menggunakan, dan 
          melindungi maklumat peribadi anda apabila anda menggunakan laman web kami.
        </p>

        <h2>Pengumpulan Maklumat</h2>
        <p>
          Kami mengumpul maklumat berikut apabila anda mendaftar di laman web kami:
        </p>
        <ul>
          <li>Nama</li>
          <li>Alamat email</li>
          <li>Maklumat profil yang anda kongsi</li>
          <li>Resipi yang anda sumbangkan</li>
        </ul>

        <h2>Penggunaan Maklumat</h2>
        <p>
          Kami menggunakan maklumat yang dikumpul untuk:
        </p>
        <ul>
          <li>Menguruskan akaun anda</li>
          <li>Membolehkan anda berkongsi resipi</li>
          <li>Menghantar kemas kini tentang laman web</li>
          <li>Meningkatkan perkhidmatan kami</li>
        </ul>

        <h2>Perlindungan Data</h2>
        <p>
          Kami mengambil langkah-langkah keselamatan yang sesuai untuk melindungi maklumat 
          peribadi anda daripada akses, pengubahan, atau pendedahan yang tidak dibenarkan.
        </p>

        <h2>Perkongsian Maklumat</h2>
        <p>
          Kami tidak akan berkongsi maklumat peribadi anda dengan pihak ketiga tanpa 
          kebenaran anda, kecuali apabila dikehendaki oleh undang-undang.
        </p>

        <h2>Kemas Kini Dasar</h2>
        <p>
          Kami mungkin mengemas kini dasar privasi ini dari semasa ke semasa. Sila semak 
          halaman ini secara berkala untuk mengetahui sebarang perubahan.
        </p>
      </div>
    </div>
  )
}
