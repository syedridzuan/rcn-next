// app/terma-penggunaan/page.tsx
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terma Penggunaan - ResepiCheNom",
  description: "Terma dan syarat penggunaan platform ResepiCheNom.",
}

export default function TermaPenggunaanPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Terma Penggunaan</h1>
      
      <div className="prose prose-orange lg:prose-lg">
        <p>
          Dengan menggunakan laman web ResepiCheNom, anda bersetuju untuk mematuhi terma 
          dan syarat berikut. Sila baca dengan teliti.
        </p>

        <h2>Penggunaan Kandungan</h2>
        <p>
          Semua resipi dan kandungan yang disiarkan di ResepiCheNom adalah:
        </p>
        <ul>
          <li>Dilindungi hak cipta</li>
          <li>Hanya untuk kegunaan peribadi</li>
          <li>Tidak boleh digunakan untuk tujuan komersial tanpa kebenaran</li>
        </ul>

        <h2>Perkongsian Resipi</h2>
        <p>
          Apabila anda berkongsi resipi di platform kami:
        </p>
        <ul>
          <li>Anda mengekalkan hak cipta resipi anda</li>
          <li>Anda memberi kami hak untuk memaparkan dan berkongsi resipi tersebut</li>
          <li>Anda bertanggungjawab atas ketepatan maklumat yang dikongsi</li>
        </ul>

        <h2>Tingkah Laku Pengguna</h2>
        <p>
          Pengguna dilarang daripada:
        </p>
        <ul>
          <li>Menyiarkan kandungan yang menyinggung perasaan</li>
          <li>Menghantar spam atau iklan yang tidak diminta</li>
          <li>Menyalahgunakan platform untuk tujuan yang tidak sah</li>
        </ul>

        <h2>Penafian</h2>
        <p>
          ResepiCheNom tidak bertanggungjawab atas:
        </p>
        <ul>
          <li>Ketepatan resipi yang dikongsi oleh pengguna</li>
          <li>Sebarang kerosakan atau kecederaan akibat mengikuti resipi</li>
          <li>Gangguan atau ketiadaan perkhidmatan</li>
        </ul>

        <h2>Perubahan Terma</h2>
        <p>
          Kami berhak untuk mengubah terma penggunaan ini pada bila-bila masa. Perubahan 
          akan berkuat kuasa serta-merta selepas disiarkan di laman web.
        </p>
      </div>
    </div>
  )
}