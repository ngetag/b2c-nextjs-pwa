import type { BlogArticle } from "@/types/blog";

export const blogs: BlogArticle[] = [
  {
    slug: "wfc-nyaman-jakarta-selatan",
    title: "WFC nyaman di Jakarta Selatan: cari fokus tanpa kehilangan vibe",
    excerpt:
      "Dari meja yang tenang sampai kopi yang menemani, ini cara memilih spot WFC yang pas untuk ritme kerjamu.",
    coverImageUrl: "https://picsum.photos/seed/blog-wfc/1400/900",
    author: "Tim NgeTag",
    publishedAt: "2026-06-08T08:00:00.000Z",
    category: "#WFCHaven",
    tags: ["#WFCHaven", "#CoffeeRun"],
    region: "Jakarta Selatan",
    spotIds: ["s2", "s1", "s5"],
    featured: true,
    sections: [
      {
        heading: "Mulai dari durasi aktivitas",
        paragraphs: [
          "Kalau agendamu hanya satu atau dua jam, spot dengan seating fleksibel sudah cukup. Untuk sesi kerja panjang, prioritaskan Wi-Fi stabil, power outlet, dan suasana yang tidak terlalu padat.",
          "Kamu bisa memakai tag WFC di NgeTag untuk membandingkan beberapa tempat sebelum berangkat, lalu menyimpan kandidat yang paling cocok.",
        ],
      },
      {
        heading: "Pilih suasana yang membantu fokus",
        paragraphs: [
          "Pagi biasanya lebih tenang untuk pekerjaan yang butuh konsentrasi. Menjelang sore, pilih spot yang punya area lebih luas agar meeting singkat tetap nyaman.",
        ],
      },
    ],
  },
  {
    slug: "event-jakarta-akhir-pekan",
    title: "Agenda akhir pekan: event Jakarta yang layak masuk kalender",
    excerpt:
      "Biar akhir pekan tidak berakhir di tempat yang itu-itu saja, susun agenda dari event, komunitas, dan spot terdekat.",
    coverImageUrl: "https://picsum.photos/seed/blog-event/1400/900",
    author: "NgeTag Editorial",
    publishedAt: "2026-06-06T08:00:00.000Z",
    category: "#EventHits",
    tags: ["#EventHits", "#Community"],
    region: "Jakarta Pusat",
    spotIds: ["s7", "s9"],
    sections: [
      {
        heading: "Buat rute yang realistis",
        paragraphs: [
          "Pilih satu event utama, lalu tambahkan satu spot untuk makan atau ngobrol setelahnya. Rute yang sederhana membuat kamu punya lebih banyak waktu untuk menikmati acaranya.",
        ],
      },
      {
        heading: "Jangan lupa cek detail event",
        paragraphs: [
          "Periksa jam mulai, lokasi, kapasitas, dan kebutuhan tiket dari halaman event. Simpan event yang menarik ke kalender agar tidak terlewat.",
        ],
      },
    ],
  },
  {
    slug: "hidden-gems-jakarta",
    title: "Hidden gems Jakarta untuk mood yang ingin sedikit berbeda",
    excerpt:
      "Tempat menarik tidak selalu muncul di urutan pertama. Gunakan tag dan lokasi untuk menemukan sudut kota yang baru.",
    coverImageUrl: "https://picsum.photos/seed/blog-hidden-gems/1400/900",
    author: "Tim NgeTag",
    publishedAt: "2026-06-03T08:00:00.000Z",
    category: "#HiddenGems",
    tags: ["#HiddenGems", "#SlowAfternoon"],
    region: "Jakarta Barat",
    spotIds: ["s12", "s15", "s18"],
    sections: [
      {
        heading: "Cari berdasarkan mood",
        paragraphs: [
          "Alih-alih hanya mencari nama tempat, mulai dengan mood yang kamu inginkan. Tag membantu mempersempit pilihan tanpa membuat eksplorasi terasa seperti daftar direktori.",
        ],
      },
      {
        heading: "Berikan ruang untuk kejutan",
        paragraphs: [
          "Coba buka rekomendasi di area yang belum sering kamu datangi. Jarak yang sedikit lebih jauh bisa menghadirkan pengalaman baru untuk makan siang atau sore yang santai.",
        ],
      },
    ],
  },
  {
    slug: "malam-jakarta-live-music",
    title: "Malam Jakarta dengan live music: dari dinner sampai after-hours",
    excerpt:
      "Panduan singkat memilih tempat dengan musik yang pas untuk makan malam, date, atau bertemu teman.",
    coverImageUrl: "https://picsum.photos/seed/blog-live-music/1400/900",
    author: "NgeTag Editorial",
    publishedAt: "2026-05-30T08:00:00.000Z",
    category: "#NightOut",
    tags: ["#NightOut", "#LiveMusic"],
    region: "Jakarta Selatan",
    spotIds: ["s20", "s22"],
    sections: [
      {
        heading: "Sesuaikan energi dengan tujuan",
        paragraphs: [
          "Untuk dinner, pilih venue dengan volume musik yang masih memungkinkan untuk berbincang. Kalau ingin lanjut after-hours, cari tempat dengan jadwal penampilan yang lebih malam.",
        ],
      },
      {
        heading: "Cek jadwal sebelum berangkat",
        paragraphs: [
          "Jadwal live music dapat berubah. Gunakan halaman event dan spot di NgeTag sebagai titik awal untuk memastikan agenda malam kamu tetap sesuai rencana.",
        ],
      },
    ],
  },
  {
    slug: "cafe-aesthetic-untuk-foto",
    title: "Cafe aesthetic yang bikin feed kamu makin stand out",
    excerpt: "Berburu spot foto dengan desain interior minimalis hingga industrial yang Instagramable.",
    coverImageUrl: "https://picsum.photos/seed/blog-cafe/1400/900",
    author: "Tim NgeTag",
    publishedAt: "2026-05-25T08:00:00.000Z",
    category: "#PhotoHunters",
    tags: ["#PhotoHunters", "#Aesthetic"],
    region: "Jakarta Selatan",
    spotIds: ["s3", "s8"],
    sections: [
      {
        heading: "Cahaya natural adalah kunci",
        paragraphs: ["Datanglah pada waktu golden hour atau cari area outdoor."],
      }
    ]
  },
  {
    slug: "kuliner-malam-kaki-lima",
    title: "Sensasi kuliner malam kaki lima yang legendaris",
    excerpt: "Tidak perlu mahal, ini dia rekomendasi street food yang rasanya berani diadu dengan restoran bintang lima.",
    coverImageUrl: "https://picsum.photos/seed/blog-streetfood/1400/900",
    author: "NgeTag Editorial",
    publishedAt: "2026-05-20T08:00:00.000Z",
    category: "#Foodies",
    tags: ["#Foodies", "#StreetFood"],
    region: "Jakarta Pusat",
    spotIds: ["s11", "s14"],
    sections: [
      {
        heading: "Siapkan perut kosong",
        paragraphs: ["Jangan makan sebelum datang, karena kamu pasti ingin mencoba banyak menu."],
      }
    ]
  },
  {
    slug: "taman-kota-buat-piknik",
    title: "Piknik sore di taman kota, oase di tengah gedung tinggi",
    excerpt: "Lepas penat dengan menggelar tikar dan menikmati angin sore di area hijau ibu kota.",
    coverImageUrl: "https://picsum.photos/seed/blog-park/1400/900",
    author: "Tim NgeTag",
    publishedAt: "2026-05-15T08:00:00.000Z",
    category: "#SlowAfternoon",
    tags: ["#SlowAfternoon", "#Picnic"],
    region: "Jakarta Selatan",
    spotIds: ["s6"],
    sections: [
      {
        heading: "Bawa perlengkapan sendiri",
        paragraphs: ["Siapkan alas duduk, makanan ringan, dan kantong sampah sendiri untuk kenyamanan."],
      }
    ]
  },
  {
    slug: "pasar-seni-kreatif-jakarta",
    title: "Mengintip pasar seni dan ruang kreatif lokal di Jakarta",
    excerpt: "Tempat berkumpulnya para seniman, kreator, dan penikmat seni indie.",
    coverImageUrl: "https://picsum.photos/seed/blog-art/1400/900",
    author: "Tim NgeTag",
    publishedAt: "2026-05-10T08:00:00.000Z",
    category: "#ArtSpace",
    tags: ["#ArtSpace", "#Creative"],
    region: "Jakarta Selatan",
    spotIds: ["s2", "s7"],
    sections: [
      {
        heading: "Dukung karya lokal",
        paragraphs: ["Jangan lupa untuk membeli merchandise atau karya seni dari kreator lokal sebagai bentuk apresiasi."],
      }
    ]
  },
  {
    slug: "tempat-nongkrong-24-jam",
    title: "Spot nongkrong 24 jam untuk pejuang insomnia",
    excerpt: "Dari warung kopi hingga cafe modern, ini dia tempat yang selalu buka kapan pun kamu butuh.",
    coverImageUrl: "https://picsum.photos/seed/blog-24hr/1400/900",
    author: "NgeTag Editorial",
    publishedAt: "2026-05-08T08:00:00.000Z",
    category: "#NightOut",
    tags: ["#NightOut", "#24Hours"],
    region: "Jakarta Barat",
    spotIds: ["s15"],
    sections: [
      {
        heading: "Tempat untuk produktif di malam hari",
        paragraphs: ["Beberapa spot menawarkan koneksi internet yang kencang di tengah malam, cocok untuk mahasiswa atau freelancer."],
      }
    ]
  },
  {
    slug: "review-kopi-susu-gula-aren",
    title: "Rekomendasi kopi susu gula aren terenak di Jabodetabek",
    excerpt: "Mencari keseimbangan sempurna antara pahitnya espresso dan manis legitnya gula aren.",
    coverImageUrl: "https://picsum.photos/seed/blog-kopi/1400/900",
    author: "Tim NgeTag",
    publishedAt: "2026-05-05T08:00:00.000Z",
    category: "#CoffeeRun",
    tags: ["#CoffeeRun", "#KopiSusu"],
    region: "Jakarta Pusat",
    spotIds: ["s1", "s9"],
    sections: [
      {
        heading: "Gula aren atau sirup aren?",
        paragraphs: ["Gula aren asli memberikan tekstur rasa caramel yang unik dan tidak bikin eneg di tenggorokan."],
      }
    ]
  },
  {
    slug: "tips-solo-traveling-sekitar-kota",
    title: "Me-time berkualitas: Panduan solo traveling santai di akhir pekan",
    excerpt: "Sesekali menikmati waktu sendiri adalah bentuk self-care. Berikut rute yang ramah untuk para solo traveler.",
    coverImageUrl: "https://picsum.photos/seed/blog-solo/1400/900",
    author: "NgeTag Editorial",
    publishedAt: "2026-05-01T08:00:00.000Z",
    category: "#SlowAfternoon",
    tags: ["#SlowAfternoon", "#SoloTrip"],
    region: "Jakarta Pusat",
    spotIds: ["s6", "s12"],
    sections: [
      {
        heading: "Bawa buku bacaan atau playlist andalan",
        paragraphs: ["Menikmati secangkir minuman hangat sambil membaca buku bisa jadi terapi mental terbaik di akhir pekan."],
      }
    ]
  },
  {
    slug: "rekomendasi-restoran-keluarga",
    title: "Restoran ramah keluarga dengan area bermain anak",
    excerpt: "Akhir pekan bersama keluarga jadi lebih mudah dengan fasilitas pendukung yang lengkap.",
    coverImageUrl: "https://picsum.photos/seed/blog-family/1400/900",
    author: "Tim NgeTag",
    publishedAt: "2026-04-28T08:00:00.000Z",
    category: "#FamilyTime",
    tags: ["#FamilyTime", "#KidsFriendly"],
    region: "Jakarta Selatan",
    spotIds: ["s14", "s8"],
    sections: [
      {
        heading: "Pesan meja lebih awal",
        paragraphs: ["Restoran keluarga biasanya sangat penuh di hari Sabtu dan Minggu siang. Jangan lupa reservasi agar lebih nyaman."],
      }
    ]
  },
  {
    slug: "jalur-sepeda-aman-jakarta",
    title: "Menjelajahi rute sepeda aman dan nyaman di pagi hari",
    excerpt: "Tetap bugar dan nikmati pemandangan kota dari atas sadel sepedamu.",
    coverImageUrl: "https://picsum.photos/seed/blog-bike/1400/900",
    author: "NgeTag Editorial",
    publishedAt: "2026-04-25T08:00:00.000Z",
    category: "#MorningVibe",
    tags: ["#MorningVibe", "#Sports"],
    region: "Jakarta Pusat",
    spotIds: ["s20"],
    sections: [
      {
        heading: "Berangkat lebih pagi, hindari polusi",
        paragraphs: ["Udara sebelum jam 7 pagi relatif lebih bersih dan jalanan belum terlalu ramai oleh kendaraan bermotor."],
      }
    ]
  },
];
