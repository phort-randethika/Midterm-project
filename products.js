const products = [
  {
    id: "aeroblade-pro-16",
    name: "AeroBlade Pro 16",
    brand: "Aero",
    tagline: "Ultimate Gaming & Creator Beast",
    price: 1899,
    rating: 4.8,
    reviewsCount: 142,
    category: "gaming",
    featured: true,
    image: "assets/images/aeroblade.png",
    description: "Designed for hardcore gamers and demanding digital creators. Features desktop-class power with custom thermal engineering, a high-refresh QHD+ display, and a vibrant custom RGB keyboard layout.",
    specs: {
      cpu: "Intel Core i7-13700HX (16 Cores, up to 5.0GHz)",
      ram: "16GB DDR5 4800MHz Dual-Channel",
      ssd: "512GB PCIe 4.0 NVMe SSD",
      gpu: "NVIDIA GeForce RTX 4070 (8GB GDDR6)",
      screen: '16" QHD+ (2560 x 1600) 165Hz IPS G-Sync Display',
      battery: "90Wh Battery (Up to 7 hours)",
      weight: "2.4 kg (5.29 lbs)"
    },
    configurations: {
      cpu: [
        { name: "Intel Core i7-13700HX", price: 0 },
        { name: "Intel Core i9-13900HX (24 Cores, up to 5.4GHz)", price: 250 }
      ],
      ram: [
        { name: "16GB DDR5 Dual-Channel", price: 0 },
        { name: "32GB DDR5 Dual-Channel", price: 100 },
        { name: "64GB DDR5 Dual-Channel", price: 250 }
      ],
      ssd: [
        { name: "512GB PCIe 4.0 NVMe", price: 0 },
        { name: "1TB PCIe 4.0 NVMe", price: 80 },
        { name: "2TB PCIe 4.0 NVMe", price: 180 }
      ],
      gpu: [
        { name: "NVIDIA RTX 4070 (8GB GDDR6)", price: 0 },
        { name: "NVIDIA RTX 4080 (12GB GDDR6)", price: 350 }
      ]
    },
    reviews: [
      { author: "Marcus V.", rating: 5, date: "2026-05-12", comment: "Absolutely shredding high frame rates in Cyberpunk! Liquid metal cooling keeps it cool and quiet." },
      { author: "Clara T.", rating: 4, date: "2026-05-28", comment: "Great screen contrast and response time. The battery is decent but expectedly short for this power level." }
    ]
  },
  {
    id: "zenbook-horizon-14",
    name: "ZenBook Horizon 14",
    brand: "Zenith",
    tagline: "Ultra-thin Productivity OLED",
    price: 1299,
    rating: 4.9,
    reviewsCount: 88,
    category: "ultrabook",
    featured: true,
    image: "assets/images/zenbook.png",
    description: "The peak of luxury business and lightweight productivity. Boasts a jaw-dropping 3K OLED touchscreen, all-day battery life, and an premium milled aerospace aluminum chassis.",
    specs: {
      cpu: "Intel Core Ultra 7 155H (16 Cores, Intel AI Boost NPU)",
      ram: "16GB LPDDR5X 7467MHz (Onboard)",
      ssd: "512GB PCIe 4.0 NVMe M.2 SSD",
      gpu: "Intel Arc Graphics (Integrated)",
      screen: '14" 3K (2880 x 1800) OLED 120Hz Touchscreen (100% DCI-P3)',
      battery: "75Wh Battery (Up to 15 hours)",
      weight: "1.2 kg (2.65 lbs)"
    },
    configurations: {
      ram: [
        { name: "16GB LPDDR5X Dual-Channel", price: 0 },
        { name: "32GB LPDDR5X Dual-Channel", price: 120 }
      ],
      ssd: [
        { name: "512GB PCIe 4.0 NVMe", price: 0 },
        { name: "1TB PCIe 4.0 NVMe", price: 100 },
        { name: "2TB PCIe 4.0 NVMe", price: 220 }
      ]
    },
    reviews: [
      { author: "David K.", rating: 5, date: "2026-04-18", comment: "The display is unreal. Pitch blacks, vibrant colors. Extremely light in my backpack." },
      { author: "Sarah M.", rating: 5, date: "2026-05-02", comment: "Keyboard is incredibly tactile. Love the facial recognition login." }
    ]
  },
  {
    id: "quantum-x1-workstation",
    name: "Quantum X1 Workstation",
    brand: "Quantum",
    tagline: "Extreme Power Developer Rig",
    price: 2499,
    rating: 4.7,
    reviewsCount: 54,
    category: "workstation",
    featured: true,
    image: "assets/images/quantum.png",
    description: "A desktop replacement workstation optimized for software compilation, CAD modeling, machine learning, and extreme data analysis. Comes equipped with ECC memory option and pro ISV certification.",
    specs: {
      cpu: "Intel Core i9-13980HX (24 Cores, up to 5.6GHz)",
      ram: "32GB DDR5 ECC 4800MHz (4x SODIMM slots)",
      ssd: "1TB PCIe 4.0 NVMe Enterprise SSD",
      gpu: "NVIDIA RTX A4000 Workstation GPU (12GB GDDR6)",
      screen: '16" UHD+ (3840 x 2400) OLED DreamColor Color-calibrated',
      battery: "99.9Wh Battery (Up to 5 hours)",
      weight: "2.8 kg (6.17 lbs)"
    },
    configurations: {
      ram: [
        { name: "32GB DDR5 ECC", price: 0 },
        { name: "64GB DDR5 ECC", price: 250 },
        { name: "128GB DDR5 ECC (4x32GB)", price: 600 }
      ],
      ssd: [
        { name: "1TB NVMe Enterprise SSD", price: 0 },
        { name: "2TB NVMe Enterprise SSD", price: 180 },
        { name: "4TB NVMe Enterprise SSD (RAID 0)", price: 450 }
      ]
    },
    reviews: [
      { author: "Elena R.", rating: 5, date: "2026-03-30", comment: "Compiles my monolithic C++ projects in seconds. 128GB RAM setup is a lifesaver for running local VMs." },
      { author: "Josh T.", rating: 4, date: "2026-04-11", comment: "Performance is stellar. It gets a bit hot under full synthetic render loads." }
    ]
  },
  {
    id: "nova-lite-14",
    name: "Nova Lite 14",
    brand: "Nova",
    tagline: "Eco-Friendly Student Companion",
    price: 649,
    rating: 4.5,
    reviewsCount: 215,
    category: "student",
    featured: false,
    image: "assets/images/nova.png",
    description: "Affordable, lightweight, and durable. Made with 30% post-consumer recycled plastics, providing reliable day-to-day performance for school work, browsing, and media consumption.",
    specs: {
      cpu: "AMD Ryzen 5 7530U (6 Cores, 12 Threads, up to 4.5GHz)",
      ram: "8GB DDR4 3200MHz",
      ssd: "256GB PCIe 3.0 NVMe SSD",
      gpu: "AMD Radeon Graphics (Integrated)",
      screen: '14" FHD (1920 x 1080) IPS Anti-glare Matte Screen',
      battery: "50Wh Battery (Up to 10 hours)",
      weight: "1.45 kg (3.2 lbs)"
    },
    configurations: {
      ram: [
        { name: "8GB DDR4 Dual-Channel", price: 0 },
        { name: "16GB DDR4 Dual-Channel", price: 60 }
      ],
      ssd: [
        { name: "256GB PCIe NVMe SSD", price: 0 },
        { name: "512GB PCIe NVMe SSD", price: 50 },
        { name: "1TB PCIe NVMe SSD", price: 120 }
      ]
    },
    reviews: [
      { author: "Tobey S.", rating: 4, date: "2026-05-19", comment: "Very decent budget laptop. It stays quiet during lecture taking, runs Microsoft Office smoothly." },
      { author: "Linda G.", rating: 5, date: "2026-05-24", comment: "Unbelievable value. I upgraded to 16GB RAM and it feels incredibly snappy. Love the eco-conscious aspect!" }
    ]
  },
  {
    id: "apex-studio-15",
    name: "Apex Studio 15",
    brand: "Apex",
    tagline: "Pro Creator Precision Laptop",
    price: 2199,
    rating: 4.9,
    reviewsCount: 104,
    category: "creator",
    featured: true,
    image: "assets/images/zenbook.png",
    description: "Crafted exclusively for filmmakers, photographers, and audio engineers. Packed with dynamic color profile profiles, high-speed connection ports, and silent thermal performance.",
    specs: {
      cpu: "Intel Core i9-13900H (14 Cores, up to 5.4GHz)",
      ram: "32GB LPDDR5X Dual-Channel",
      ssd: "1TB PCIe 4.0 NVMe SSD",
      gpu: "NVIDIA GeForce RTX 4060 Studio Edition (8GB GDDR6)",
      screen: '15.4" Mini-LED (3024 x 1964) 120Hz Liquid Dynamic Display (1600 nits Peak)',
      battery: "100Wh Battery (Up to 18 hours)",
      weight: "1.6 kg (3.5 lbs)"
    },
    configurations: {
      ram: [
        { name: "32GB LPDDR5X", price: 0 },
        { name: "64GB LPDDR5X", price: 300 }
      ],
      ssd: [
        { name: "1TB NVMe Gen4", price: 0 },
        { name: "2TB NVMe Gen4", price: 150 },
        { name: "4TB NVMe Gen4", price: 400 }
      ]
    },
    reviews: [
      { author: "Rachel F.", rating: 5, date: "2026-04-03", comment: "Mini-LED display is a dream for HDR color grading. Thunderbolt 4 ports read my external SSD arrays seamlessly." },
      { author: "Vincent A.", rating: 5, date: "2026-04-22", comment: "The speakers sound like a high-end stereo setup. Super quiet even when rendering 4K ProRes files." }
    ]
  },
  {
    id: "titan-rugged-15",
    name: "Titan Rugged 15",
    brand: "Titan",
    tagline: "All-Terrain Ruggedized Workhorse",
    price: 1599,
    rating: 4.6,
    reviewsCount: 37,
    category: "rugged",
    featured: false,
    image: "assets/images/quantum.png",
    description: "Built to survive drops, vibrations, dust, water, and thermal extremes. MIL-STD-810H certified with a hot-swappable dual battery design and an outdoor viewable 1000-nits display.",
    specs: {
      cpu: "Intel Core i5-1340P (12 Cores, up to 4.6GHz)",
      ram: "16GB DDR4 3200MHz (Heavy-duty protected)",
      ssd: "512GB PCIe 4.0 NVMe Rugged SSD",
      gpu: "Intel Iris Xe Graphics",
      screen: '15.6" FHD (1920 x 1080) 1000-nits Sunlight Readable screen',
      battery: "85Wh Dual Hot-Swappable (Up to 12 hours total)",
      weight: "3.1 kg (6.83 lbs)"
    },
    configurations: {
      ssd: [
        { name: "512GB Rugged NVMe SSD", price: 0 },
        { name: "1TB Rugged NVMe SSD", price: 100 },
        { name: "2TB Rugged NVMe SSD", price: 250 }
      ]
    },
    reviews: [
      { author: "Garrison W.", rating: 5, date: "2026-02-15", comment: "Dropped this off the back of a utility truck onto concrete. Not a single crack. Interface works flawlessly." },
      { author: "Megan J.", rating: 4, date: "2026-03-01", comment: "Sunlight readability is outstanding. It is heavy, but that is the trade-off for bulletproof durability." }
    ]
  }
];
