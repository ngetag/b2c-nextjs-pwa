import type {
  Community,
  CommunityCategory,
  Interest,
} from "@/types/interest";

export const interests: Interest[] = [
  { id: "i-coffee", label: "Ngopi", slug: "ngopi" },
  { id: "i-gaming", label: "Gaming", slug: "gaming" },
  { id: "i-music", label: "Musik", slug: "musik" },
  { id: "i-sports", label: "Olahraga", slug: "olahraga" },
  { id: "i-startup", label: "Startup", slug: "startup" },
  { id: "i-photo", label: "Fotografi", slug: "fotografi" },
  { id: "i-wfc", label: "WFC", slug: "wfc" },
];

export const communityCategories: CommunityCategory[] = [
  {
    id: "band-music",
    title: "Music",
  },
  {
    id: "gaming",
    title: "Gaming",
  },
  {
    id: "sport",
    title: "Sport",
  },
  {
    id: "startup-tech",
    title: "Startup & Tech",
  },
  {
    id: "creator",
    title: "Kreator",
  },
  {
    id: "anime-pop",
    title: "Anime & Pop Culture",
  },
  {
    id: "coffee-wfc",
    title: "Coffee & WFC",
  },
];

export const communities: Community[] = [
  {
    id: "c-nada-senja-official",
    title: "Nada Senja Official Community",
    description:
      "Komunitas resmi band Nada Senja untuk update rilisan, listening party, dan meet-up fans.",
    coverImage: "https://picsum.photos/seed/community-music-1/900/520",
    categoryId: "band-music",
    tags: ["Official", "Band", "Listening Party"],
    memberCount: 18420,
    activeEvents: 4,
    lastActiveAt: "2026-06-06T09:10:00.000Z",
    isOfficial: true,
    managedBy: "Artist Management",
    managementName: "Senja Records",
    communityType: "official",
    updates: [
      {
        id: "u-nada-1",
        title: "Listening session album baru",
        body: "Manajemen membuka registrasi listening session terbatas untuk member komunitas.",
        publishedAt: "2026-06-06T08:30:00.000Z",
        authorName: "Senja Records",
      },
    ],
    agendas: [
      {
        id: "a-nada-1",
        title: "Fan Gathering Nada Senja",
        startAt: "2026-07-12T12:00:00.000Z",
        description: "Meet-up fans dan acoustic session.",
      },
    ],
  },
  {
    id: "c-voice-room",
    title: "Voice Room Fan Hub",
    description:
      "Fan hub penyanyi solo dan vocal coach untuk berbagi cover, workshop, dan jadwal showcase.",
    coverImage: "https://picsum.photos/seed/community-music-2/900/520",
    categoryId: "band-music",
    tags: ["Singer", "Fan Hub", "Cover"],
    memberCount: 9310,
    activeEvents: 2,
    lastActiveAt: "2026-06-05T14:20:00.000Z",
    isOfficial: false,
    communityType: "fanbase",
    updates: [
      {
        id: "u-voice-1",
        title: "Open submission cover bulan ini",
        body: "Admin membuka thread cover lagu pilihan untuk dikurasi ke showcase komunitas.",
        publishedAt: "2026-06-05T13:00:00.000Z",
        authorName: "Admin Voice Room",
      },
    ],
    agendas: [
      {
        id: "a-voice-1",
        title: "Online Vocal Jam",
        startAt: "2026-07-03T13:00:00.000Z",
        description: "Sesi sharing dan feedback cover lagu.",
      },
    ],
  },
  {
    id: "c-valorant-squad-id",
    title: "Valorant Squad ID",
    description:
      "Komunitas pemain Valorant untuk party ranked, scrim, coaching, dan mini tournament.",
    coverImage: "https://picsum.photos/seed/community-gaming-1/900/520",
    categoryId: "gaming",
    tags: ["Game Community", "Esports", "Tournament"],
    memberCount: 22780,
    activeEvents: 6,
    lastActiveAt: "2026-06-06T07:45:00.000Z",
    isOfficial: false,
    communityType: "team",
    updates: [
      {
        id: "u-valo-1",
        title: "Bracket mini tournament sudah rilis",
        body: "Cek jadwal match dan rules terbaru sebelum check-in.",
        publishedAt: "2026-06-06T07:20:00.000Z",
        authorName: "Tournament Admin",
      },
    ],
    agendas: [
      {
        id: "a-valo-1",
        title: "Weekend Scrim",
        startAt: "2026-06-22T12:00:00.000Z",
        description: "Scrim komunitas untuk tim amatir.",
      },
    ],
  },
  {
    id: "c-rpg-guild-nusantara",
    title: "RPG Guild Nusantara",
    description:
      "Guild lintas game RPG/MMO untuk party, raid, guide build, dan event seasonal.",
    coverImage: "https://picsum.photos/seed/community-gaming-2/900/520",
    categoryId: "gaming",
    tags: ["Guild", "MMO", "Raid"],
    memberCount: 12890,
    activeEvents: 3,
    lastActiveAt: "2026-06-04T10:10:00.000Z",
    isOfficial: false,
    communityType: "guild",
    updates: [
      {
        id: "u-rpg-1",
        title: "Raid night dibuka untuk member baru",
        body: "Member baru bisa daftar party latihan sebelum raid utama.",
        publishedAt: "2026-06-04T09:30:00.000Z",
        authorName: "Guild Master",
      },
    ],
    agendas: [
      {
        id: "a-rpg-1",
        title: "Guild Raid Night",
        startAt: "2026-06-29T13:00:00.000Z",
        description: "Raid bersama dan sharing build.",
      },
    ],
  },
  {
    id: "c-runcrew-jakarta",
    title: "Runcrew Jakarta",
    description:
      "Komunitas lari untuk easy run, long run, race prep, dan sharing route mingguan.",
    coverImage: "https://picsum.photos/seed/community-sport-1/900/520",
    categoryId: "sport",
    tags: ["Running", "Workout", "Race Prep"],
    memberCount: 15720,
    activeEvents: 5,
    lastActiveAt: "2026-06-06T05:45:00.000Z",
    isOfficial: false,
    communityType: "club",
    updates: [
      {
        id: "u-run-1",
        title: "Route long run Minggu ini",
        body: "Admin membagikan route 12K dan titik kumpul untuk pace group.",
        publishedAt: "2026-06-06T05:00:00.000Z",
        authorName: "Coach Runcrew",
      },
    ],
    agendas: [
      {
        id: "a-run-1",
        title: "Sunday Long Run",
        startAt: "2026-06-15T23:00:00.000Z",
        description: "Long run 12K dengan beberapa pace group.",
      },
    ],
  },
  {
    id: "c-futsal-afterhours",
    title: "Futsal Afterhours",
    description:
      "Komunitas futsal casual dan liga kecil untuk pekerja setelah jam kantor.",
    coverImage: "https://picsum.photos/seed/community-sport-2/900/520",
    categoryId: "sport",
    tags: ["Futsal", "League", "After Office"],
    memberCount: 6840,
    activeEvents: 2,
    lastActiveAt: "2026-06-03T12:40:00.000Z",
    isOfficial: false,
    communityType: "club",
    updates: [
      {
        id: "u-futsal-1",
        title: "Slot sparring Jumat dibuka",
        body: "Tim baru bisa daftar untuk sparring community night.",
        publishedAt: "2026-06-03T11:50:00.000Z",
        authorName: "Admin Liga",
      },
    ],
    agendas: [
      {
        id: "a-futsal-1",
        title: "Community Sparring",
        startAt: "2026-06-21T12:30:00.000Z",
        description: "Sparring 4 tim dengan sistem rotasi.",
      },
    ],
  },
  {
    id: "c-dev-nusantara",
    title: "Developer Nusantara",
    description:
      "Developer community untuk diskusi frontend, backend, open-source, dan career growth.",
    coverImage: "https://picsum.photos/seed/community-tech-1/900/520",
    categoryId: "startup-tech",
    tags: ["Developer", "Open Source", "Career"],
    memberCount: 31120,
    activeEvents: 7,
    lastActiveAt: "2026-06-06T08:05:00.000Z",
    isOfficial: false,
    communityType: "learning",
    updates: [
      {
        id: "u-dev-1",
        title: "Call for speaker meetup Juli",
        body: "Komunitas membuka slot talk untuk topik web performance dan AI tooling.",
        publishedAt: "2026-06-06T07:40:00.000Z",
        authorName: "Program Lead",
      },
    ],
    agendas: [
      {
        id: "a-dev-1",
        title: "Frontend Performance Night",
        startAt: "2026-07-09T12:00:00.000Z",
        description: "Meetup teknis tentang performance dan observability.",
      },
    ],
  },
  {
    id: "c-ai-founder-lab",
    title: "AI Founder Lab",
    description:
      "Komunitas founder, builder, dan AI enthusiast untuk validasi produk dan demo night.",
    coverImage: "https://picsum.photos/seed/community-tech-2/900/520",
    categoryId: "startup-tech",
    tags: ["AI", "Founder", "Demo Night"],
    memberCount: 8460,
    activeEvents: 3,
    lastActiveAt: "2026-06-05T09:15:00.000Z",
    isOfficial: false,
    communityType: "network",
    updates: [
      {
        id: "u-ai-1",
        title: "Batch demo night sudah dibuka",
        body: "Founder bisa submit produk AI untuk feedback komunitas.",
        publishedAt: "2026-06-05T08:30:00.000Z",
        authorName: "AI Founder Lab",
      },
    ],
    agendas: [
      {
        id: "a-ai-1",
        title: "AI Product Demo Night",
        startAt: "2026-07-18T12:00:00.000Z",
        description: "Demo produk dan sesi feedback.",
      },
    ],
  },
  {
    id: "c-creator-hub-id",
    title: "Creator Hub ID",
    description:
      "Komunitas kreator YouTube, TikTok, dan short-form video untuk kolaborasi konten.",
    coverImage: "https://picsum.photos/seed/community-creator-1/900/520",
    categoryId: "creator",
    tags: ["YouTube", "TikTok", "Content"],
    memberCount: 19670,
    activeEvents: 4,
    lastActiveAt: "2026-06-05T16:00:00.000Z",
    isOfficial: false,
    communityType: "creator",
    updates: [
      {
        id: "u-creator-1",
        title: "Creator collab board aktif",
        body: "Member bisa mencari partner collab untuk konten weekend.",
        publishedAt: "2026-06-05T15:20:00.000Z",
        authorName: "Creator Hub Admin",
      },
    ],
    agendas: [
      {
        id: "a-creator-1",
        title: "Creator Content Sprint",
        startAt: "2026-07-06T06:00:00.000Z",
        description: "Sesi produksi konten bareng dan review format.",
      },
    ],
  },
  {
    id: "c-photo-walkers",
    title: "Photo Walkers Collective",
    description:
      "Komunitas fotografer untuk photo walk, editing clinic, dan kurasi spot foto.",
    coverImage: "https://picsum.photos/seed/community-creator-2/900/520",
    categoryId: "creator",
    tags: ["Photography", "Photo Walk", "Editing"],
    memberCount: 11300,
    activeEvents: 2,
    lastActiveAt: "2026-06-04T06:50:00.000Z",
    isOfficial: false,
    communityType: "creator",
    updates: [
      {
        id: "u-photo-1",
        title: "Tema photo walk bulan ini",
        body: "Tema bulan ini: street color dan night ambience.",
        publishedAt: "2026-06-04T06:20:00.000Z",
        authorName: "Photo Curator",
      },
    ],
    agendas: [
      {
        id: "a-photo-1",
        title: "Night Street Photo Walk",
        startAt: "2026-07-13T12:00:00.000Z",
        description: "Photo walk malam dengan rute pusat kota.",
      },
    ],
  },
  {
    id: "c-anime-weekend",
    title: "Anime Weekend Club",
    description:
      "Komunitas anime, manga, dan watch party untuk fans pop culture Jepang.",
    coverImage: "https://picsum.photos/seed/community-anime-1/900/520",
    categoryId: "anime-pop",
    tags: ["Anime", "Manga", "Watch Party"],
    memberCount: 24750,
    activeEvents: 5,
    lastActiveAt: "2026-06-06T06:25:00.000Z",
    isOfficial: false,
    communityType: "fanbase",
    updates: [
      {
        id: "u-anime-1",
        title: "Voting watch party dibuka",
        body: "Member bisa vote anime untuk watch party minggu depan.",
        publishedAt: "2026-06-06T06:00:00.000Z",
        authorName: "Anime Weekend Admin",
      },
    ],
    agendas: [
      {
        id: "a-anime-1",
        title: "Seasonal Watch Party",
        startAt: "2026-06-28T11:00:00.000Z",
        description: "Nonton bareng episode pilihan komunitas.",
      },
    ],
  },
  {
    id: "c-cosplay-stage",
    title: "Cosplay Stage ID",
    description:
      "Komunitas cosplayer untuk workshop kostum, stage practice, dan event convention.",
    coverImage: "https://picsum.photos/seed/community-anime-2/900/520",
    categoryId: "anime-pop",
    tags: ["Cosplay", "Convention", "Workshop"],
    memberCount: 10980,
    activeEvents: 3,
    lastActiveAt: "2026-06-02T13:35:00.000Z",
    isOfficial: false,
    communityType: "club",
    updates: [
      {
        id: "u-cosplay-1",
        title: "Workshop prop making",
        body: "Mentor komunitas membuka kelas prop making untuk pemula.",
        publishedAt: "2026-06-02T12:40:00.000Z",
        authorName: "Cosplay Stage Team",
      },
    ],
    agendas: [
      {
        id: "a-cosplay-1",
        title: "Stage Practice",
        startAt: "2026-07-20T07:00:00.000Z",
        description: "Latihan blocking dan performance untuk convention.",
      },
    ],
  },
  {
    id: "c-cafe-hoppers",
    title: "Cafe Hoppers Club",
    description:
      "Komunitas cafe hopping untuk menemukan coffee shop baru dan agenda crawl.",
    coverImage: "https://picsum.photos/seed/community-coffee-1/900/520",
    categoryId: "coffee-wfc",
    tags: ["Coffee", "Cafe Hopping", "Review"],
    memberCount: 17640,
    activeEvents: 4,
    lastActiveAt: "2026-06-06T04:30:00.000Z",
    isOfficial: false,
    communityType: "club",
    updates: [
      {
        id: "u-cafe-1",
        title: "Crawl Bogor dibuka",
        body: "Rute cafe crawl baru dibuka untuk member minggu ini.",
        publishedAt: "2026-06-06T04:00:00.000Z",
        authorName: "Cafe Hoppers Admin",
      },
    ],
    agendas: [
      {
        id: "a-cafe-1",
        title: "Bogor Cafe Crawl",
        startAt: "2026-06-30T03:00:00.000Z",
        description: "Kunjungan ke 4 cafe pilihan komunitas.",
      },
    ],
  },
  {
    id: "c-remote-worker-id",
    title: "Remote Worker ID",
    description:
      "Komunitas remote worker dan WFC untuk rekomendasi tempat kerja, coworking, dan networking.",
    coverImage: "https://picsum.photos/seed/community-coffee-2/900/520",
    categoryId: "coffee-wfc",
    tags: ["Remote Work", "WFC", "Coworking"],
    memberCount: 14320,
    activeEvents: 3,
    lastActiveAt: "2026-06-05T03:10:00.000Z",
    isOfficial: false,
    communityType: "network",
    updates: [
      {
        id: "u-remote-1",
        title: "Coworking day batch baru",
        body: "Member bisa daftar coworking day untuk networking dan focused work.",
        publishedAt: "2026-06-05T02:40:00.000Z",
        authorName: "Remote Worker ID",
      },
    ],
    agendas: [
      {
        id: "a-remote-1",
        title: "Coworking Day",
        startAt: "2026-07-04T02:00:00.000Z",
        description: "Kerja bareng dan networking ringan.",
      },
    ],
  },
];
