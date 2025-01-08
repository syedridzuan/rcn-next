// File: app/(main)/(information)/terma-penggunaan/page.tsx
import type { Metadata } from "next";

/**
 * Optionally, you can export metadata for SEO
 */
export const metadata: Metadata = {
  title: "Terma & Syarat Penggunaan | ResepiCheNom",
  description: "Laman rasmi untuk terma dan syarat penggunaan ResepiCheNom",
};

export default function TermaPenggunaanPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Terma &amp; Syarat Penggunaan</h1>
      <p>
        Selamat datang ke laman <strong>ResepiCheNom</strong>. Dengan mengakses
        dan menggunakan perkhidmatan kami, anda dianggap bersetuju untuk
        mematuhi terma dan syarat berikut. Sila baca dengan teliti.
      </p>

      <section>
        <h2 className="text-xl font-semibold">
          1. Sifat Laman &amp; Perkhidmatan
        </h2>
        <ol className="list-decimal list-inside space-y-2 mt-2">
          <li>
            <strong>ResepiCheNom</strong> ialah platform utama untuk perkongsian
            resepi dan idea masakan.
          </li>
          <li>
            Pengguna boleh mendaftar akaun, memuat naik resepi dan gambar
            masakan, serta meninggalkan komen.
          </li>
          <li>
            Kami turut menawarkan langganan berbayar (&ldquo;Paid
            Subscription&rdquo;) yang memberikan akses kandungan tambahan atau
            faedah tertentu (contoh: resepi eksklusif).
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">2. Pengumpulan Data Peribadi</h2>
        <ol className="list-decimal list-inside space-y-2 mt-2">
          <li>
            Apabila mendaftar atau menggunakan perkhidmatan kami, anda mungkin
            dikehendaki memberikan maklumat peribadi seperti:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>Nama penuh</li>
              <li>Alamat emel</li>
              <li>Tarikh lahir</li>
            </ul>
          </li>
          <li>
            Maklumat ini digunakan untuk tujuan berikut (tetapi tidak terhad
            kepada):
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>Mendaftar akaun</li>
              <li>Menghubungi anda mengenai perubahan perkhidmatan</li>
              <li>Meningkatkan pengalaman penggunaan di laman web kami</li>
            </ul>
          </li>
          <li>
            Kami mematuhi undang-undang perlindungan data Malaysia. Sila rujuk
            &ldquo;Dasar Privasi&rdquo; (jika ada) untuk penerangan lanjut
            bagaimana data anda dikumpul, digunakan, dan dilindungi.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          3. Kandungan Dihantar oleh Pengguna
        </h2>
        <ol className="list-decimal list-inside space-y-2 mt-2">
          <li>
            <strong>Resepi &amp; Kandungan Lain:</strong> Anda boleh memuat naik
            resepi, gambar, atau komen (&ldquo;kandungan pengguna&rdquo;).
            Dengan menyerahkan kandungan, anda menjamin bahawa anda mempunyai
            hak untuk berkongsi kandungan tersebut dan ia tidak melanggar hak
            milik intelektual pihak ketiga.
          </li>
          <li>
            <strong>Hak Cipta:</strong> Hak cipta untuk kandungan pengguna kekal
            milik anda. Namun, anda memberi <strong>ResepiCheNom</strong> hak
            bukan eksklusif, bebas royalti, dan boleh dipindah milik untuk
            menggunakan, memaparkan, mengedar, dan mempromosikan kandungan
            tersebut di platform kami.
          </li>
          <li>
            <strong>Tanggungjawab:</strong> Anda bertanggungjawab terhadap
            ketepatan, keaslian, dan keselamatan kandungan yang dimuat naik.
            Kandungan yang menyinggung, memfitnah, atau melanggar undang-undang
            Malaysia adalah dilarang sama sekali.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          4. Perkhidmatan Langganan Berbayar
        </h2>
        <ol className="list-decimal list-inside space-y-2 mt-2">
          <li>
            <strong>Pendaftaran Langganan:</strong> Pengguna boleh memilih untuk
            melanggan pakej berbayar yang menawarkan kandungan premium (cth:
            resepi eksklusif). Maklumat bayaran seperti kad kredit akan
            dikendalikan oleh penyedia perkhidmatan pembayaran pihak ketiga yang
            diiktiraf.
          </li>
          <li>
            <strong>Pembatalan &amp; Penggantungan:</strong> Pengguna boleh
            membatalkan langganan pada bila-bila masa. Akses kepada kandungan
            premium akan terus sah sehingga tempoh bil terakhir tamat. Sekiranya
            berlaku pelanggaran terma, kami berhak untuk menggantung atau
            menamatkan langganan tanpa pemulangan bayaran.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          5. Komen &amp; Interaksi Pengguna
        </h2>
        <ol className="list-decimal list-inside space-y-2 mt-2">
          <li>
            Pengguna boleh memberi komen di ruangan yang disediakan. Elakkan
            kandungan berunsur spam, penghinaan, perkauman, lucah, atau
            melanggar undang-undang.
          </li>
          <li>
            ResepiCheNom berhak untuk memadam atau menyekat komen atau akaun
            pengguna yang didapati melanggar terma ini.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          6. Penafian &amp; Had Liabiliti
        </h2>
        <ol className="list-decimal list-inside space-y-2 mt-2">
          <li>
            <strong>Ketepatan Resepi:</strong> Semua resepi disediakan oleh
            komuniti atau pasukan kami atas dasar “seadanya.” Kami tidak
            menjamin ketepatan lengkap resipi tersebut. Pengguna
            bertanggungjawab menilai kesesuaian resepi bagi keperluan peribadi,
            termasuk hal alergi atau keperluan diet.
          </li>
          <li>
            <strong>Risiko Kesihatan:</strong> ResepiCheNom tidak
            bertanggungjawab ke atas sebarang kerosakan, kecederaan, atau
            masalah kesihatan yang timbul daripada pengaplikasian resepi.
          </li>
          <li>
            <strong>Tuntutan Ganti Rugi:</strong> Dalam apa jua keadaan,
            ResepiCheNom tidak akan bertanggungjawab atas kerugian langsung,
            tidak langsung, sampingan, atau turutan yang timbul daripada
            penggunaan platform ini.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">7. Pengubahsuaian Terma</h2>
        <ol className="list-decimal list-inside space-y-2 mt-2">
          <li>
            ResepiCheNom berhak meminda atau mengemas kini terma dan syarat ini
            pada bila-bila masa.
          </li>
          <li>
            Sebarang perubahan akan berkuat kuasa serta-merta selepas disiarkan
            di laman web. Pengguna digalakkan menyemak terma terkini secara
            berkala.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          8. Undang-Undang &amp; Bidang Kuasa
        </h2>
        <ol className="list-decimal list-inside space-y-2 mt-2">
          <li>Terma dan syarat ini tertakluk kepada undang-undang Malaysia.</li>
          <li>
            Sebarang pertikaian yang timbul daripada atau berkaitan dengan
            penggunaan laman ini hendaklah dirujuk dan diselesaikan di mahkamah
            Malaysia.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">9. Penamatan Akaun</h2>
        <ol className="list-decimal list-inside space-y-2 mt-2">
          <li>
            ResepiCheNom berhak menamatkan atau menggantung akaun anda jika
            didapati melanggar terma, atau atas apa-apa alasan munasabah lain.
          </li>
          <li>
            Penamatan akaun tidak menghapuskan hak ResepiCheNom untuk mengambil
            tindakan lanjut sekiranya berlaku pelanggaran berat.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">10. Hubungi Kami</h2>
        <p className="mt-2">
          Sekiranya anda mempunyai sebarang soalan berkenaan Terma Penggunaan
          ini, sila hubungi pasukan sokongan melalui emel:&nbsp;
          <a
            href="mailto:support@resepichenom.com"
            className="text-blue-600 underline"
          >
            support@resepichenom.com
          </a>
        </p>
      </section>

      <p>
        Dengan menggunakan ResepiCheNom, anda mengakui telah membaca, memahami,
        dan bersetuju dengan kesemua terma dan syarat di atas.
      </p>
    </main>
  );
}
