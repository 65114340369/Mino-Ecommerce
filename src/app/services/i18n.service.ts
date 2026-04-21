import { Injectable, signal, computed } from '@angular/core';

export type Lang = 'th' | 'en';

const STORAGE_KEY = 'mino_lang';

// ── Translation dictionary ────────────────────────────────────────────────────
const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  th: {
    // Navbar
    'nav.home':       'หน้าแรก',
    'nav.products':   'สินค้า',
    'nav.login':      'เข้าสู่ระบบ',
    'nav.search':     'ค้นหาสินค้า...',

    // Landing
    'landing.tag':        'New Collection 2026',
    'landing.title1':     'สินค้าคุณภาพ',
    'landing.title2':     'ดีไซน์มินิมอล',
    'landing.desc':       'คัดสรรสินค้าพรีเมียมที่ตอบโจทย์ไลฟ์สไตล์ของคุณ\nส่งฟรีทั่วประเทศ เมื่อซื้อครบ ฿500',
    'landing.cta':        'ดูสินค้าทั้งหมด',
    'landing.new':        'สินค้าใหม่ →',
    'landing.customers':  'ลูกค้า',
    'landing.products':   'สินค้า',
    'landing.rating':     'คะแนน',
    'landing.bestseller': 'สินค้าขายดี',
    'landing.bestsub':    'สินค้าที่ลูกค้าเลือกมากที่สุด',
    'landing.seeall':     'ดูทั้งหมด →',
    'landing.banner.title': 'ส่งฟรีทั่วประเทศ',
    'landing.banner.desc':  'เมื่อซื้อครบ ฿500 ขึ้นไป ไม่มีขั้นต่ำสำหรับสมาชิก',
    'landing.banner.cta':   'เริ่มช้อปเลย',
    'landing.cat.electronics': 'อิเล็กทรอนิกส์',
    'landing.cat.clothing':    'เสื้อผ้า',
    'landing.cat.home':        'ของใช้ในบ้าน',
    'landing.cat.accessories': 'เครื่องประดับ',

    // Products
    'products.title':    'สินค้าทั้งหมด',
    'products.items':    'รายการ',
    'products.category': 'หมวดหมู่',
    'products.all':      'ทั้งหมด',
    'products.price':    'ช่วงราคา',
    'products.sort':     'เรียงตาม',
    'products.default':  'ค่าเริ่มต้น',
    'products.price_asc':  'ราคา: ต่ำ → สูง',
    'products.price_desc': 'ราคา: สูง → ต่ำ',
    'products.rating':   'คะแนนสูงสุด',
    'products.newest':   'ใหม่ล่าสุด',
    'products.instock':  'มีสินค้าเท่านั้น',
    'products.clear':    'ล้างตัวกรอง',
    'products.empty':    'ไม่พบสินค้าที่ตรงกับเงื่อนไข',
    'products.stock_only': 'มีสต็อก',

    // Cart / Checkout
    'cart.added':        'เพิ่มลงตะกร้าแล้ว',
    'checkout.title':    'ชำระเงิน',
    'checkout.back':     'กลับไปช้อปต่อ',
    'checkout.empty':    'ตะกร้าว่างเปล่า',
    'checkout.success':  'สั่งซื้อสำเร็จ!',
    'checkout.confirm':  'ยืนยันคำสั่งซื้อ',
    'checkout.secure':   'ข้อมูลของคุณถูกเข้ารหัสและปลอดภัย',
    'checkout.free':     'ฟรี',
    'checkout.subtotal': 'ยอดรวม',
    'checkout.shipping': 'ค่าจัดส่ง',
    'checkout.total':    'ยอดชำระทั้งหมด',
    'checkout.summary':  'สรุปคำสั่งซื้อ',
    'checkout.address':  'ที่อยู่จัดส่ง',
    'checkout.payment':  'วิธีการชำระเงิน',
    'checkout.order_no': 'หมายเลขคำสั่งซื้อ',
    'checkout.home':     'กลับหน้าแรก',
    'checkout.shop':     'เลือกซื้อสินค้า',

    // Auth
    'auth.login':        'เข้าสู่ระบบ',
    'auth.register':     'สมัครสมาชิก',
    'auth.email':        'อีเมล',
    'auth.password':     'รหัสผ่าน',
    'auth.confirm_pw':   'ยืนยันรหัสผ่าน',
    'auth.firstname':    'ชื่อ',
    'auth.lastname':     'นามสกุล',
    'auth.phone':        'เบอร์โทรศัพท์',
    'auth.no_account':   'ยังไม่มีบัญชี?',
    'auth.has_account':  'มีบัญชีแล้ว?',
    'auth.reset_db':     'รีเซ็ตฐานข้อมูล',

    // Dashboard
    'dash.profile':      'ข้อมูลส่วนตัว',
    'dash.address':      'ที่อยู่จัดส่ง',
    'dash.orders':       'ประวัติการสั่งซื้อ',
    'dash.logout':       'ออกจากระบบ',
    'dash.save':         'บันทึกข้อมูล',
    'dash.saved':        'บันทึกสำเร็จ',
    'dash.change_pw':    'เปลี่ยนรหัสผ่าน',

    // Common
    'common.add_cart':   'เพิ่มลงตะกร้า',
    'common.buy_now':    'ซื้อเลย',
    'common.out_stock':  'สินค้าหมด',
    'common.bestseller': 'ขายดี',
    'common.reviews':    'รีวิว',
    'common.related':    'สินค้าที่เกี่ยวข้อง',
    'common.cancel':     'ยกเลิก',
    'common.save':       'บันทึก',
    'common.edit':       'แก้ไข',
    'common.delete':     'ลบ',
    'common.back':       'กลับ',
    'common.qty':        'จำนวน',
    'common.free_ship':  'ส่งฟรีเมื่อซื้อครบ ฿500',
    'common.return':     'คืนสินค้าได้ภายใน 30 วัน',
    'common.authentic':  'รับประกันสินค้าแท้ 100%',
  },

  en: {
    // Navbar
    'nav.home':       'Home',
    'nav.products':   'Products',
    'nav.login':      'Sign In',
    'nav.search':     'Search products...',

    // Landing
    'landing.tag':        'New Collection 2026',
    'landing.title1':     'Premium Quality',
    'landing.title2':     'Minimal Design',
    'landing.desc':       'Curated premium products for your lifestyle.\nFree shipping nationwide on orders over ฿500',
    'landing.cta':        'Shop All Products',
    'landing.new':        'New Arrivals →',
    'landing.customers':  'Customers',
    'landing.products':   'Products',
    'landing.rating':     'Rating',
    'landing.bestseller': 'Best Sellers',
    'landing.bestsub':    'Most popular products',
    'landing.seeall':     'See all →',
    'landing.banner.title': 'Free Nationwide Shipping',
    'landing.banner.desc':  'On orders over ฿500. No minimum for members.',
    'landing.banner.cta':   'Start Shopping',
    'landing.cat.electronics': 'Electronics',
    'landing.cat.clothing':    'Clothing',
    'landing.cat.home':        'Home & Living',
    'landing.cat.accessories': 'Accessories',

    // Products
    'products.title':    'All Products',
    'products.items':    'items',
    'products.category': 'Category',
    'products.all':      'All',
    'products.price':    'Price Range',
    'products.sort':     'Sort By',
    'products.default':  'Default',
    'products.price_asc':  'Price: Low → High',
    'products.price_desc': 'Price: High → Low',
    'products.rating':   'Top Rated',
    'products.newest':   'Newest',
    'products.instock':  'In Stock Only',
    'products.clear':    'Clear Filters',
    'products.empty':    'No products found',
    'products.stock_only': 'In Stock',

    // Cart / Checkout
    'cart.added':        'Added to cart',
    'checkout.title':    'Checkout',
    'checkout.back':     'Continue Shopping',
    'checkout.empty':    'Your cart is empty',
    'checkout.success':  'Order Placed!',
    'checkout.confirm':  'Place Order',
    'checkout.secure':   'Your information is encrypted and secure',
    'checkout.free':     'Free',
    'checkout.subtotal': 'Subtotal',
    'checkout.shipping': 'Shipping',
    'checkout.total':    'Total',
    'checkout.summary':  'Order Summary',
    'checkout.address':  'Shipping Address',
    'checkout.payment':  'Payment Method',
    'checkout.order_no': 'Order Number',
    'checkout.home':     'Back to Home',
    'checkout.shop':     'Shop Now',

    // Auth
    'auth.login':        'Sign In',
    'auth.register':     'Create Account',
    'auth.email':        'Email',
    'auth.password':     'Password',
    'auth.confirm_pw':   'Confirm Password',
    'auth.firstname':    'First Name',
    'auth.lastname':     'Last Name',
    'auth.phone':        'Phone Number',
    'auth.no_account':   "Don't have an account?",
    'auth.has_account':  'Already have an account?',
    'auth.reset_db':     'Reset Database',

    // Dashboard
    'dash.profile':      'Profile',
    'dash.address':      'Shipping Addresses',
    'dash.orders':       'Order History',
    'dash.logout':       'Sign Out',
    'dash.save':         'Save Changes',
    'dash.saved':        'Saved!',
    'dash.change_pw':    'Change Password',

    // Common
    'common.add_cart':   'Add to Cart',
    'common.buy_now':    'Buy Now',
    'common.out_stock':  'Out of Stock',
    'common.bestseller': 'Best Seller',
    'common.reviews':    'reviews',
    'common.related':    'Related Products',
    'common.cancel':     'Cancel',
    'common.save':       'Save',
    'common.edit':       'Edit',
    'common.delete':     'Delete',
    'common.back':       'Back',
    'common.qty':        'Quantity',
    'common.free_ship':  'Free shipping on orders over ฿500',
    'common.return':     '30-day return policy',
    'common.authentic':  '100% authentic guarantee',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _lang = signal<Lang>(
    (localStorage.getItem(STORAGE_KEY) as Lang) ?? 'th'
  );

  readonly lang        = this._lang.asReadonly();
  readonly isEnglish   = computed(() => this._lang() === 'en');
  readonly langLabel   = computed(() => this._lang() === 'th' ? 'EN' : 'ไทย');

  setLang(lang: Lang): void {
    this._lang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  toggle(): void {
    this.setLang(this._lang() === 'th' ? 'en' : 'th');
  }

  t(key: string): string {
    return TRANSLATIONS[this._lang()][key] ?? TRANSLATIONS['th'][key] ?? key;
  }
}
