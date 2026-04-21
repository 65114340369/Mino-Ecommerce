import { Product } from '../models/product.model';
import { DESCRIPTIONS_TH } from './product-descriptions-th';

const now = Date.now();

export const SEED_PRODUCTS: Product[] = [
  {
    id: 1,
    slug: 'minimal-leather-wallet',
    name: 'Minimal Leather Wallet',
    nameTh: 'กระเป๋าสตางค์หนังแท้ มินิมอล',
    description: `## Minimal Leather Wallet

Designed for those who love simplicity. Made from **Full-Grain cowhide leather** of the highest quality.

### Features
- Holds **6 cards** plus a banknote compartment
- Only **6mm thin** when fully loaded
- Leather develops a beautiful _patina_ over time
- Available in 3 colors: Brown, Black, Tan

### Materials
| Part | Material |
|------|----------|
| Exterior | Full-Grain Leather |
| Thread | Waxed Linen Thread |
| Edge | Hand-burnished |

> "Good things don't need to be big" — Our design philosophy`,
    descriptionTh: DESCRIPTIONS_TH['minimal-leather-wallet'],
    price: 890,
    originalPrice: 1200,
    stock: 45,
    images: [
      { id: '1a', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', alt: 'Minimal Leather Wallet front', isPrimary: true },
      { id: '1b', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', alt: 'Wallet open view', isPrimary: false },
      { id: '1c', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', alt: 'Leather detail', isPrimary: false },
    ],
    category: 'accessories',
    tags: ['หนังแท้', 'มินิมอล', 'ของขวัญ', 'กระเป๋าสตางค์'],
    rating: 4.8,
    reviewCount: 234,
    isBestseller: true,
    createdAt: now - 86400000 * 30,
    updatedAt: now - 86400000 * 5,
  },
  {
    id: 2,
    slug: 'wireless-noise-cancel-headphones',
    name: 'Wireless Noise-Cancel Headphones',
    nameTh: 'หูฟังไร้สายตัดเสียงรบกวน',
    description: `## Wireless Noise-Cancelling Headphones

Latest **Active Noise Cancellation (ANC)** technology lets you immerse yourself in music completely.

### Key Specs
- Battery life **30 hours** (ANC on)
- 10-minute quick charge = 3 hours playback
- **Bluetooth 5.3** with multipoint 2-device connection
- 40mm driver for Hi-Res Audio

### Modes
1. **ANC Mode** — Maximum noise cancellation
2. **Transparency Mode** — Hear your surroundings
3. **Normal Mode** — Battery saving`,
    descriptionTh: DESCRIPTIONS_TH['wireless-noise-cancel-headphones'],
    price: 3490,
    originalPrice: 4500,
    stock: 23,
    images: [
      { id: '2a', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', alt: 'Wireless headphones', isPrimary: true },
      { id: '2b', url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80', alt: 'Black headphones', isPrimary: false },
    ],
    category: 'electronics',
    tags: ['ไร้สาย', 'ตัดเสียง', 'พรีเมียม', 'หูฟัง', 'Bluetooth'],
    rating: 4.9,
    reviewCount: 512,
    isBestseller: true,
    createdAt: now - 86400000 * 25,
    updatedAt: now - 86400000 * 2,
  },
  {
    id: 3,
    slug: 'ceramic-pour-over-coffee-set',
    name: 'Ceramic Pour-Over Coffee Set',
    nameTh: 'ชุดดริปกาแฟเซรามิก',
    description: `## Ceramic Pour-Over Coffee Set

For coffee lovers who want the perfect brewing experience.

### What's in the box?
- V60-style ceramic dripper x1
- 300ml ceramic cup x2
- Paper filters x40
- Brewing guide booklet

### Basic Brewing Recipe
1. Heat water to **92-96 degrees C**
2. Use **15g** coffee per **250ml** water
3. Pour 50ml first, wait **30 seconds** (bloom)
4. Pour remaining water slowly over **2-3 minutes**`,
    descriptionTh: DESCRIPTIONS_TH['ceramic-pour-over-coffee-set'],
    price: 1290,
    stock: 18,
    images: [
      { id: '3a', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', alt: 'Pour-over coffee set', isPrimary: true },
      { id: '3b', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80', alt: 'Drip coffee', isPrimary: false },
    ],
    category: 'home',
    tags: ['กาแฟ', 'เซรามิก', 'ของขวัญ', 'ดริป', 'ครัว'],
    rating: 4.7,
    reviewCount: 189,
    isBestseller: true,
    createdAt: now - 86400000 * 20,
    updatedAt: now - 86400000 * 3,
  },
  {
    id: 4,
    slug: 'merino-wool-sweater',
    name: 'Merino Wool Sweater',
    nameTh: 'เสื้อสเวตเตอร์ขนแกะเมอริโน',
    description: `## Merino Wool Sweater

Made from **Grade A Merino wool** from New Zealand — the softest of all wools.

### Why Merino?
- **No itch** — fibers finer than 18.5 microns
- **Breathable** — absorbs 30% of its weight in moisture
- **Odor resistant** — natural antibacterial properties
- **Machine washable** — gentle cycle in a laundry bag

### Size Guide
| Size | Chest | Length |
|------|-------|--------|
| S | 88-92 cm | 65 cm |
| M | 92-96 cm | 67 cm |
| L | 96-102 cm | 69 cm |
| XL | 102-108 cm | 71 cm |`,
    descriptionTh: DESCRIPTIONS_TH['merino-wool-sweater'],
    price: 2190,
    originalPrice: 2800,
    stock: 31,
    images: [
      { id: '4a', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80', alt: 'Merino wool sweater', isPrimary: true },
      { id: '4b', url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80', alt: 'Fabric detail', isPrimary: false },
    ],
    category: 'clothing',
    tags: ['ขนแกะ', 'ออร์แกนิก', 'คุณภาพสูง', 'เสื้อกันหนาว', 'Merino'],
    rating: 4.6,
    reviewCount: 98,
    isBestseller: true,
    createdAt: now - 86400000 * 15,
    updatedAt: now - 86400000 * 1,
  },
  {
    id: 5,
    slug: 'bamboo-desk-organizer',
    name: 'Bamboo Desk Organizer',
    nameTh: 'ที่จัดระเบียบโต๊ะจากไม้ไผ่',
    description: `## Bamboo Desk Organizer

Made from **100% natural bamboo** with no chemicals in the production process.

### Storage Compartments
- Large slots x2 (pens, pencils, rulers)
- Medium slots x3 (scissors, stationery)
- Phone/watch slot x1
- Small drawer x1

### Product Info
- Dimensions: **25 x 15 x 12 cm**
- Weight: 380g
- Material: Moso Bamboo`,
    descriptionTh: DESCRIPTIONS_TH['bamboo-desk-organizer'],
    price: 650,
    stock: 67,
    images: [
      { id: '5a', url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80', alt: 'Bamboo desk organizer', isPrimary: true },
    ],
    category: 'home',
    tags: ['ไม้ไผ่', 'อีโค', 'ออฟฟิศ', 'จัดระเบียบ', 'โต๊ะทำงาน'],
    rating: 4.5,
    reviewCount: 76,
    createdAt: now - 86400000 * 10,
    updatedAt: now - 86400000 * 1,
  },
  {
    id: 6,
    slug: 'smart-water-bottle',
    name: 'Smart Water Bottle',
    nameTh: 'ขวดน้ำอัจฉริยะ',
    description: `## Smart Water Bottle

Track your daily water intake through the **MINO Health** app (iOS & Android).

### Features
- **LED Reminder** — flashes every 2 hours
- **Temperature Display** — shows water temp on OLED screen
- **Hydration Tracking** — syncs with Apple Health / Google Fit
- Keeps cold **24 hours** / hot **12 hours**

### Specs
- Capacity: 500ml
- Material: 316 Stainless Steel
- Lid: BPA-Free Tritan
- Charging: USB-C (30-day battery)`,
    descriptionTh: DESCRIPTIONS_TH['smart-water-bottle'],
    price: 1490,
    stock: 52,
    images: [
      { id: '6a', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', alt: 'Smart water bottle', isPrimary: true },
    ],
    category: 'accessories',
    tags: ['สมาร์ท', 'สุขภาพ', 'ไร้สาย', 'ขวดน้ำ', 'IoT'],
    rating: 4.4,
    reviewCount: 143,
    createdAt: now - 86400000 * 8,
    updatedAt: now,
  },
  {
    id: 7,
    slug: 'linen-tote-bag',
    name: 'Linen Tote Bag',
    nameTh: 'กระเป๋าผ้าลินิน',
    description: `## Linen Tote Bag

Made from **natural linen fabric** — lightweight, strong, and biodegradable.

### Why Linen?
- **30% stronger** than cotton
- Absorbs moisture well, stays fresh
- Gets softer with every wash
- Lower carbon footprint than synthetic fabrics

### Size and Capacity
- Dimensions: **40 x 35 x 12 cm**
- Strap length: 65 cm (shoulder carry)
- Load capacity: **10 kg**
- 1 inner zip pocket`,
    descriptionTh: DESCRIPTIONS_TH['linen-tote-bag'],
    price: 490,
    stock: 89,
    images: [
      { id: '7a', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80', alt: 'Linen tote bag', isPrimary: true },
    ],
    category: 'accessories',
    tags: ['ลินิน', 'อีโค', 'ทนทาน', 'กระเป๋า', 'ธรรมชาติ'],
    rating: 4.3,
    reviewCount: 201,
    createdAt: now - 86400000 * 7,
    updatedAt: now,
  },
  {
    id: 8,
    slug: 'mechanical-keyboard',
    name: 'Mechanical Keyboard',
    nameTh: 'คีย์บอร์ด Mechanical 75%',
    description: `## Mechanical Keyboard 75%

**Compact 75% layout** gives you more desk space while keeping Function row and Arrow keys.

### Switch Options
| Switch | Actuation | Sound | Best For |
|--------|-----------|-------|---------|
| Cherry MX Red | 45g | Silent | Gaming |
| **Cherry MX Brown** | 45g | Light click | General use |
| Cherry MX Blue | 50g | Loud click | Typing |

### Features
- **Hot-swap** — change switches without soldering
- RGB Backlight 16.7 million colors
- USB-C + Bluetooth 5.0 connectivity
- Gasket mount for reduced vibration`,
    descriptionTh: DESCRIPTIONS_TH['mechanical-keyboard'],
    price: 2890,
    originalPrice: 3500,
    stock: 0,
    images: [
      { id: '8a', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', alt: 'Mechanical Keyboard', isPrimary: true },
      { id: '8b', url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&q=80', alt: 'Keyboard side view', isPrimary: false },
    ],
    category: 'electronics',
    tags: ['เกมมิ่ง', 'ออฟฟิศ', 'พรีเมียม', 'คีย์บอร์ด', 'Mechanical'],
    rating: 4.8,
    reviewCount: 367,
    createdAt: now - 86400000 * 6,
    updatedAt: now,
  },
  {
    id: 9,
    slug: 'scented-soy-candle-set',
    name: 'Scented Soy Candle Set',
    nameTh: 'เทียนหอมถั่วเหลือง เซ็ต 3 กลิ่น',
    description: `## Scented Soy Candle Set — 3 Scents

Made from **100% Soy Wax** — burns clean with no smoke or toxins.

### Scents Included
1. Lavender and Eucalyptus — relaxing, stress-relieving
2. Vanilla and Sandalwood — warm and sweet
3. Citrus and Mint — fresh and focus-enhancing

### Burn Info
- Burn time: **40-50 hours** per candle
- Size: 200ml / 180g
- Wick: Lead-free cotton wick`,
    descriptionTh: DESCRIPTIONS_TH['scented-soy-candle-set'],
    price: 780,
    stock: 34,
    images: [
      { id: '9a', url: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&q=80', alt: 'Scented candles', isPrimary: true },
    ],
    category: 'home',
    tags: ['อโรมา', 'ธรรมชาติ', 'ของขวัญ', 'เทียน', 'Soy Wax'],
    rating: 4.6,
    reviewCount: 88,
    createdAt: now - 86400000 * 5,
    updatedAt: now,
  },
  {
    id: 10,
    slug: 'running-shoes-pro',
    name: 'Running Shoes Pro',
    nameTh: 'รองเท้าวิ่ง Pro Series',
    description: `## Running Shoes Pro Series

Developed with national marathon runners for maximum performance.

### Technology
- **CloudFoam+** — 40% better impact absorption
- **AirMesh Upper** — 360-degree ventilation, weighs only 240g
- **Carbon Fiber Plate** — 85% energy return
- **Grip Rubber Outsole** — non-slip on all surfaces

### Best For
- Road running 5K-42K
- Daily training
- Race day`,
    descriptionTh: DESCRIPTIONS_TH['running-shoes-pro'],
    price: 3290,
    originalPrice: 4200,
    stock: 19,
    images: [
      { id: '10a', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', alt: 'Running shoes', isPrimary: true },
      { id: '10b', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', alt: 'Running shoes side view', isPrimary: false },
    ],
    category: 'clothing',
    tags: ['วิ่ง', 'สปอร์ต', 'เทคโนโลยี', 'รองเท้า', 'มาราธอน'],
    rating: 4.7,
    reviewCount: 445,
    createdAt: now - 86400000 * 4,
    updatedAt: now,
  },
  {
    id: 11,
    slug: 'portable-bluetooth-speaker',
    name: 'Portable Bluetooth Speaker',
    nameTh: 'ลำโพง Bluetooth พกพา',
    description: `## Portable Bluetooth Speaker

Powerful 360-degree sound, **IPX7 waterproof** — take it anywhere.

### Sound Specs
- Power output: **20W** (2 x 10W)
- Frequency: 60Hz - 20kHz
- Drivers: 2 x 45mm Full-range + Passive Radiator

### Features
- **IPX7 waterproof** — submerge 1 meter for 30 minutes
- Battery life **20 hours** (at 70% volume)
- **Party Mode** — connect 2 units simultaneously
- USB-C charging, full charge in 2 hours
- Built-in microphone for calls`,
    descriptionTh: DESCRIPTIONS_TH['portable-bluetooth-speaker'],
    price: 1890,
    stock: 41,
    images: [
      { id: '11a', url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', alt: 'Bluetooth speaker', isPrimary: true },
    ],
    category: 'electronics',
    tags: ['กันน้ำ', 'พกพา', 'ไร้สาย', 'ลำโพง', 'Bluetooth'],
    rating: 4.5,
    reviewCount: 278,
    createdAt: now - 86400000 * 3,
    updatedAt: now,
  },
  {
    id: 12,
    slug: 'yoga-mat-premium',
    name: 'Yoga Mat Premium',
    nameTh: 'เสื่อโยคะพรีเมียม Natural Rubber',
    description: `## Premium Yoga Mat — Natural Rubber

Made from **100% natural rubber** — no PVC, no Phthalates.

### Why Natural Rubber?
- Better grip than PVC, both dry and wet hands
- Biodegradable
- No chemical smell

### Specs
| Item | Value |
|------|-------|
| Thickness | 6mm |
| Dimensions | 183 x 61 cm |
| Weight | 2.1 kg |
| Surface | Microfiber top / Rubber bottom |

### Best For
- All yoga styles (Hatha, Vinyasa, Yin)
- Pilates
- Stretching and Meditation`,
    descriptionTh: DESCRIPTIONS_TH['yoga-mat-premium'],
    price: 1190,
    stock: 28,
    images: [
      { id: '12a', url: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80', alt: 'Yoga mat', isPrimary: true },
    ],
    category: 'accessories',
    tags: ['โยคะ', 'ฟิตเนส', 'ธรรมชาติ', 'ออกกำลังกาย', 'Pilates'],
    rating: 4.4,
    reviewCount: 156,
    createdAt: now - 86400000 * 2,
    updatedAt: now,
  },
];
