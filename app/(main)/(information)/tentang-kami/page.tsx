import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Youtube,
  Upload,
  Users,
  Play,
  Award,
  Heart,
  Briefcase,
  Coffee,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-orange-600 mb-4">
          Tentang Che Nom
        </h1>
        <p className="text-xl text-gray-600">
          Perjalanan dari Kedah ke Hati Jutaan Peminat Masakan
        </p>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col md:flex-row gap-8 items-center mb-16">
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/images/chenom/chenom_about_optimized.jpg"
              alt="Che Nom"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">Kisah Peribadi</h2>
          <p className="text-lg text-gray-600">
            Dilahirkan dan dibesarkan di Kampung Sungai Petani Changlun, Kedah,
            Che Nom membesar dengan kenangan indah di kedai runcit kecil milik
            ibunya. Di sinilah aroma Laksa dan Ais Kacang menjadi sebahagian
            daripada zaman kanak-kanak, menanam minat terhadap masakan Melayu
            dan nilai kerja keras.
          </p>
          <p className="text-lg text-gray-600">
            Perjalanan pendidikan membawa Che Nom ke UiTM, memperoleh Diploma
            Sains Komputer dan Sarjana Muda Sains (Kepujian) Matematik Pemodelan
            dan Analitik. Selepas berkhidmat sebagai Jurutera Telekomunikasi,
            beliau mengikuti panggilan jiwanya dalam dunia masakan, bermula
            dengan berkongsi resipi dalam talian dan akhirnya menjadi YouTuber
            dan pencipta resipi sepenuh masa pada tahun 2019.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-6 text-center">
            <Upload className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-orange-600 mb-1">506</div>
            <div className="text-gray-600">Video Dimuat Naik</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-orange-600 mb-1">2.23M</div>
            <div className="text-gray-600">Pelanggan</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-6 text-center">
            <Play className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-orange-600 mb-1">382M+</div>
            <div className="text-gray-600">Tontonan</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-6 text-center">
            <Youtube className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-orange-600 mb-1">2011</div>
            <div className="text-gray-600">Tahun Bermula</div>
          </CardContent>
        </Card>
      </div>

      {/* Mission Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
        <h2 className="text-2xl font-bold text-orange-600 mb-6">Misi</h2>
        <p className="text-lg text-gray-600">
          Bagi Che Nom, memasak bukan sekadar seni penyediaan makanan; ia adalah
          jambatan yang menghubungkan hati dan budaya. Melalui resipi yang
          berkualiti tinggi dan terperinci, Che Nom berusaha membawa keyakinan
          kepada setiap dapur untuk mencipta hidangan asli Malaysia. Setiap
          langkah dan petua yang dikongsi adalah hasil pengalaman dan kajian
          teliti, bertujuan untuk membimbing sama ada tukang masak di rumah
          mahupun pemilik perniagaan kecil.
        </p>
      </div>

      {/* Community Impact Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-orange-600 mb-6">
          Impak Komuniti
        </h2>
        <div className="space-y-4">
          <p className="text-lg text-gray-600">
            Perjalanan Che Nom bermula dengan menulis resipi pada 2013, mengisi
            hujung minggu dengan ujian resipi, memasak, menyunting, dan
            berkongsi. Pengorbanan masa dan tenaga akhirnya membuahkan hasil
            yang manis pada 2019, apabila hobi ini berkembang menjadi kerjaya
            impian.
          </p>
          <p className="text-lg text-gray-600">
            Kini, laman web resepichenom.com menjadi destinasi lebih 2 juta
            pengunjung setiap bulan, memberi inspirasi kepada tukang masak di
            rumah dan menyokong perniagaan kecil dalam merealisasikan impian
            mereka. Platform ini bukan sekadar ruang perkongsian resipi, tetapi
            telah menjadi wadah untuk memperkenalkan masakan Malaysia di persada
            tempatan dan antarabangsa.
          </p>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
        <h2 className="text-2xl font-bold text-orange-600 mb-6">Pencapaian</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Youtube className="w-6 h-6 text-orange-500 mr-2" />
              Kejayaan di YouTube
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>506 video yang menginspirasi</li>
              <li>Komuniti 2.23 juta pelanggan setia</li>
              <li>Mencapai lebih 382 juta tontonan</li>
              <li>Memulakan perjalanan digital sejak 2011</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Award className="w-6 h-6 text-orange-500 mr-2" />
              Pengiktirafan
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                Finalis BPBH 34 Berita Harian dalam kategori Youtuber Popular
              </li>
              <li>Beberapa pencalonan Astro Gempak Awards</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Personal Life Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-orange-600 mb-6">
          Kehidupan Peribadi
        </h2>
        <p className="text-lg text-gray-600">
          Sebagai ibu kepada tiga cahaya mata, dapur adalah tempat Che Nom
          menganyam kasih sayang keluarga. Suami beliau, dengan citarasa yang
          teliti seperti Gordon Ramsay, sering memberi inspirasi untuk
          memperhalusi setiap resipi! Sokongan padu daripada komuniti peminat
          menjadi pembakar semangat untuk Che Nom terus berkarya dan berkongsi.
        </p>
      </div>

      {/* Future Vision Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-orange-600 mb-6">
          Visi Masa Depan
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Dalam melangkah ke hadapan, Che Nom bermimpi untuk:
        </p>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <Heart className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
            <span className="text-gray-600">
              Membina komuniti peminat memasak yang dinamik dan saling menyokong
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Briefcase className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
            <span className="text-gray-600">
              Memperkasa usahawan tempatan dan perniagaan kecil dalam industri
              makanan
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Coffee className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
            <span className="text-gray-600">
              Mencipta platform baharu untuk berinteraksi dengan penonton,
              membentuk ruang inspirasi dan pembelajaran yang lebih interaktif
            </span>
          </li>
        </ul>
        <p className="text-lg text-gray-600 mt-6 font-semibold">
          Mari bersama-sama mengangkat martabat warisan masakan Malaysia ke
          persada dunia!
        </p>
      </div>
    </div>
  );
}
