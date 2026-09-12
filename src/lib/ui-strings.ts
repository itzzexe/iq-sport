/**
 * Every short interface string on the public site, in both languages.
 *
 * This object does two jobs:
 *   1. It generates the "النصوص" (Labels) tab in the CMS "Site settings" global,
 *      so editors can reword any button or label without a deploy.
 *   2. It is the fallback the site uses when an editor leaves a label empty.
 *
 * Keys are stable identifiers; never rename one without migrating the stored value.
 */
export const UI_STRINGS = {
  // navigation & chrome
  menu: { ar: 'القائمة', en: 'Menu' },
  footerNav: { ar: 'روابط الموقع', en: 'Site links' },
  close: { ar: 'إغلاق', en: 'Close' },
  skipToContent: { ar: 'تخطٍّ إلى المحتوى', en: 'Skip to content' },
  switchLanguage: { ar: 'English', en: 'العربية' },
  bookNow: { ar: 'احجز الآن', en: 'Book now' },
  backHome: { ar: 'العودة إلى الصفحة الرئيسية', en: 'Back to the home page' },
  backToSections: { ar: 'العودة إلى الأقسام', en: 'Back to all sections' },
  scrollHint: { ar: 'مرّر للأسفل', en: 'Scroll' },
  loading: { ar: 'جارٍ التحميل', en: 'Loading' },
  explore: { ar: 'استكشف القسم', en: 'Explore the division' },
  lane: { ar: 'مسار الأقسام', en: 'Divisions track' },
  journeyHint: { ar: 'مرّر لتبدأ الجولة', en: 'Scroll to start the tour' },
  startLine: { ar: 'خط البداية', en: 'Start line' },
  finishLine: { ar: 'خط النهاية', en: 'Finish line' },
  allDivisions: { ar: 'كل الأقسام', en: 'All divisions' },
  learnMore: { ar: 'اعرف المزيد', en: 'Learn more' },
  details: { ar: 'التفاصيل', en: 'Details' },
  viewAll: { ar: 'عرض الكل', en: 'View all' },
  rights: { ar: 'جميع الحقوق محفوظة', en: 'All rights reserved' },
  backToTop: { ar: 'العودة إلى الأعلى', en: 'Back to top' },
  notFoundTitle: { ar: 'الصفحة غير موجودة', en: 'Page not found' },
  notFoundBody: {
    ar: 'الرابط الذي وصلت منه غير صحيح أو تم نقل الصفحة.',
    en: 'The link you followed is broken or the page has moved.',
  },

  // contact block
  phone: { ar: 'الهاتف', en: 'Phone' },
  whatsapp: { ar: 'واتساب', en: 'WhatsApp' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  address: { ar: 'العنوان', en: 'Address' },
  hours: { ar: 'ساعات العمل', en: 'Opening hours' },
  follow: { ar: 'تابعنا', en: 'Follow us' },
  viewOnMap: { ar: 'عرض على الخريطة', en: 'View on map' },
  call: { ar: 'اتصال', en: 'Call' },

  // divisions
  availableAt: { ar: 'متوفر في', en: 'Available at' },
  coaches: { ar: 'المدربون', en: 'Coaches' },
  bookThis: { ar: 'احجز في هذا القسم', en: 'Book this division' },
  otherDivisions: { ar: 'أقسام أخرى', en: 'Other divisions' },
  features: { ar: 'المزايا', en: 'Features' },

  // branches
  branch: { ar: 'الفرع', en: 'Branch' },
  facilities: { ar: 'المرافق', en: 'Facilities' },
  bookHere: { ar: 'احجز في هذا الفرع', en: 'Book at this branch' },

  // statistics
  rushHours: { ar: 'ساعات الذروة', en: 'Peak hours' },

  // team
  division: { ar: 'القسم', en: 'Division' },

  // tournaments & courses
  all: { ar: 'الكل', en: 'All' },
  tournaments: { ar: 'البطولات', en: 'Tournaments' },
  courses: { ar: 'الدورات التدريبية', en: 'Training courses' },
  upcoming: { ar: 'قادمة', en: 'Upcoming' },
  past: { ar: 'سابقة', en: 'Past' },
  date: { ar: 'التاريخ', en: 'Date' },
  location: { ar: 'المكان', en: 'Location' },
  register: { ar: 'سجّل الآن', en: 'Register' },
  gallery: { ar: 'معرض الصور', en: 'Gallery' },
  tournament: { ar: 'بطولة', en: 'Tournament' },
  course: { ar: 'دورة تدريبية', en: 'Training course' },

  // booking form
  formName: { ar: 'الاسم', en: 'Name' },
  formPhone: { ar: 'رقم الهاتف', en: 'Phone number' },
  formBranch: { ar: 'الفرع', en: 'Branch' },
  formActivity: { ar: 'النشاط', en: 'Activity' },
  formDate: { ar: 'التاريخ المفضّل', en: 'Preferred date' },
  formNotes: { ar: 'ملاحظات (اختياري)', en: 'Notes (optional)' },
  formChoose: { ar: 'اختر…', en: 'Choose…' },
  formSubmit: { ar: 'إرسال طلب الحجز', en: 'Send booking request' },
  formSubmitting: { ar: 'جارٍ الإرسال…', en: 'Sending…' },
  formWhatsApp: { ar: 'أو أرسل عبر واتساب', en: 'Or send via WhatsApp' },
  formRequired: { ar: 'هذا الحقل مطلوب', en: 'This field is required' },
  formPhoneInvalid: { ar: 'أدخل رقم هاتف صحيح', en: 'Enter a valid phone number' },
  formFix: { ar: 'يرجى إكمال الحقول المطلوبة.', en: 'Please complete the required fields.' },
  formError: {
    ar: 'تعذّر إرسال الطلب الآن. حاول مرة أخرى أو تواصل معنا عبر واتساب.',
    en: 'We could not send your request right now. Please try again or reach us on WhatsApp.',
  },
} as const

export type UIKey = keyof typeof UI_STRINGS
export const UI_KEYS = Object.keys(UI_STRINGS) as UIKey[]
