// File: app/(main)/(information)/dasar-privasi/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dasar Privasi - ResepiCheNom",
  description:
    "Dasar privasi ResepiCheNom mengenai penggunaan dan perlindungan data peribadi anda.",
};

export default function DasarPrivasiPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Dasar Privasi</h1>

      <div className="prose prose-orange lg:prose-lg">
        <p>
          Dasar privasi ini menerangkan bagaimana <strong>ResepiCheNom</strong>{" "}
          (&quot;kami&quot; atau &quot;laman ini&quot;) mengumpul, menggunakan,
          dan melindungi maklumat peribadi anda apabila anda menggunakan laman
          web kami. Kami komited untuk mematuhi undang-undang yang berkaitan,
          termasuk Akta Perlindungan Data Peribadi (PDPA) di Malaysia.
        </p>

        <h2>1. Skop Pengumpulan Data</h2>
        <p>
          Kami mungkin mengumpul beberapa jenis maklumat peribadi daripada anda,
          termasuk:
        </p>
        <ul>
          <li>Nama penuh</li>
          <li>Alamat emel</li>
          <li>Tarikh lahir</li>
          <li>Gambar profil (jika dimuat naik)</li>
          <li>Maklumat pembayaran (untuk langganan berbayar)</li>
          <li>Alamat IP dan rekod aktiviti/logging</li>
        </ul>
        <p>
          Maklumat ini dikumpul menerusi pendaftaran akaun, penggunaan laman,
          atau interaksi dengan ciri tertentu (contoh: memuat naik resipi).
        </p>

        <h2>2. Tujuan &amp; Penggunaan Data</h2>
        <ul>
          <li>
            <strong>Pendaftaran Akaun:</strong> Untuk membolehkan anda log masuk
            dan menggunakan ciri laman.
          </li>
          <li>
            <strong>E-mel Pengesahan &amp; Pemasaran:</strong> Menghantar
            pengesahan, notifikasi terkini, atau promosi jika anda bersetuju.
          </li>
          <li>
            <strong>Analisis Dalaman:</strong> Menambah baik ciri laman,
            memahami trend, dan memperibadikan pengalaman.
          </li>
          <li>
            <strong>Pemprosesan Pembayaran:</strong> Untuk melancarkan transaksi
            langganan berbayar melalui pembekal pembayaran pihak ketiga.
          </li>
        </ul>
        <p>
          Kami juga berkongsi data asas (contoh: maklumat pembayaran) dengan
          pembekal pihak ketiga seperti penyedia hosting, penyedia analisis
          (seperti Google AdSense), dan sistem pembayaran, dengan syarat mereka
          mematuhi kewajipan kerahsiaan.
        </p>

        <h2>3. Tempoh Penyimpanan Data</h2>
        <ul>
          <li>
            Kami menyimpan data peribadi sepanjang tempoh ia diperlukan bagi
            tujuan asal pengumpulannya, atau mengikut keperluan undang-undang.
          </li>
          <li>
            Apabila data tidak lagi relevan, kami akan memadam atau
            mengekalkannya dalam bentuk anonim. Tiada dasar pemadaman automatik
            tertentu, tetapi anda boleh meminta pemadaman akaun pada bila-bila
            masa (rujuk Seksyen 4).
          </li>
        </ul>

        <h2>4. Hak Pengguna</h2>
        <p>
          <strong>Akses &amp; Pembetulan:</strong> Anda boleh meminta salinan
          data peribadi anda atau membuat pembetulan jika terdapat kesilapan.
        </p>
        <p>
          <strong>Penarikan Persetujuan &amp; Pemadaman:</strong> Anda juga
          boleh meminta akaun dipadam atau menarik balik persetujuan untuk
          komunikasi pemasaran. Sila hubungi{" "}
          <a
            href="mailto:support@resepichenom.com"
            className="underline text-orange-600"
          >
            support@resepichenom.com
          </a>{" "}
          atau gunakan borang di{" "}
          <a href="/hubungi-kami/" className="underline text-orange-600">
            Hubungi Kami
          </a>
          .
        </p>

        <h2>5. Cookies &amp; Teknologi Penjejakan</h2>
        <p>
          Kami menggunakan cookies atau teknologi serupa untuk analisis,
          pengiklanan (cth. Google AdSense), dan untuk mengekalkan sesi log
          masuk anda. Anda boleh menyekat cookies di pelayar, tetapi sesetengah
          ciri mungkin terjejas.
        </p>

        <h2>6. Pematuhan Undang-undang</h2>
        <p>
          Kami berusaha mematuhi peruntukan PDPA di Malaysia dan undang-undang
          lain yang berkaitan. Tiada pengecualian khusus pada masa ini.
        </p>

        <h2>7. Keselamatan Data</h2>
        <p>
          Kami mengambil langkah keselamatan munasabah (seperti enkripsi dan
          kawalan akses) untuk melindungi data peribadi daripada akses tidak
          dibenarkan. Walau bagaimanapun, tiada jaminan keselamatan 100%.
        </p>

        <h2>8. Pindaan Dasar Privasi</h2>
        <p>
          Kami boleh meminda dasar ini pada bila-bila masa. Sebarang perubahan
          akan disiarkan di laman web dan berkuat kuasa serta-merta. Pengguna
          digalakkan menyemak halaman ini dari semasa ke semasa.
        </p>

        <h2>9. Pertanyaan &amp; Aduan Privasi</h2>
        <p>
          Jika anda mempunyai sebarang soalan berkaitan privasi atau hendak
          membuat aduan, sila e-mel ke{" "}
          <a
            href="mailto:support@resepichenom.com"
            className="underline text-orange-600"
          >
            support@resepichenom.com
          </a>{" "}
          atau hantarkan mesej melalui{" "}
          <a href="/hubungi-kami/" className="underline text-orange-600">
            Hubungi Kami
          </a>
          .
        </p>

        <p>
          Dengan menggunakan laman ini, anda mengakui bahawa anda telah membaca
          dan memahami Dasar Privasi ini. Jika anda tidak bersetuju dengan
          mana-mana bahagian, sila hentikan penggunaan laman ini.
        </p>
      </div>
    </div>
  );
}
