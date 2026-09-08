/**
 * Single source of truth for every string, figure and asset reference on the site.
 * All content is transcribed from the two supplied brand documents:
 *   - "مجموعة العراق الرياضية.pdf"  (company profile)
 *   - "IQ SPORT GROUP BRAND GUIDELINE.pdf"  (identity)
 * Figures are quoted exactly as they appear in the profile deck.
 */

export type Lang = 'ar' | 'en'
export type Bi = Record<Lang, string>

/* ------------------------------------------------------------------ brand */

/** Palette page 06 of the brand guideline, verbatim. */
export const BRAND = {
  white: '#FFFFFF',
  black: '#000000',
  navy: '#002173',
  green: '#00FF00',
  orange: '#FD7322',
  /** Volt tint sampled from the profile deck's own artwork (map, key art). */
  volt: '#CBF41C',
} as const

export const SITE = {
  name: { ar: 'مجموعة العراق الرياضية', en: 'IQ Sports Group' } satisfies Bi,
  shortName: { ar: 'العراق الرياضية', en: 'IQ Sports' } satisfies Bi,
  tagline: {
    ar: 'وجهة رياضية موحّدة',
    en: 'A unified sports destination',
  } satisfies Bi,
  /** Brand-concept line, brand guideline page 02. */
  concept: {
    ar: 'تجمع بين تخصصات رياضية متعددة تحت هوية معاصرة واحدة، محورها الحركة وطاقة المجتمع والأداء.',
    en: 'Bringing multiple disciplines together under one contemporary identity focused on movement, community energy and performance.',
  } satisfies Bi,
  url: 'https://iqsportsgroup.iq',
  locale: { ar: 'ar_IQ', en: 'en_IQ' },
  city: { ar: 'بغداد', en: 'Baghdad' } satisfies Bi,
  country: { ar: 'العراق', en: 'Iraq' } satisfies Bi,
} as const

/** The four brand pillars, brand guideline page 02. */
export const PILLARS: { key: string; label: Bi }[] = [
  { key: 'movement', label: { ar: 'الحركة', en: 'Movement' } },
  { key: 'community', label: { ar: 'المجتمع', en: 'Community' } },
  { key: 'performance', label: { ar: 'الأداء', en: 'Performance' } },
  { key: 'energy', label: { ar: 'الطاقة', en: 'Energy' } },
]

export const CONCEPT_WORDS: Bi[] = [
  { ar: 'نشِط', en: 'Active' },
  { ar: 'متصل', en: 'Connected' },
  { ar: 'مندفع', en: 'Driven' },
  { ar: 'ديناميكي', en: 'Dynamic' },
]

/* ------------------------------------------------------------------- about */

export const ABOUT = {
  eyebrow: { ar: 'نبذة عنّا', en: 'About us' } satisfies Bi,
  title: {
    ar: 'الأولى في العراق من نوعها',
    en: 'The first of its kind in Iraq',
  } satisfies Bi,
  body: [
    {
      ar: 'شركة عراقية متخصصة، الأولى في العراق من نوعها، في إنشاء وإدارة وتشغيل الأقسام والأكاديميات الرياضية.',
      en: 'An Iraqi company — the first of its kind in the country — specialised in building, managing and operating sports facilities and academies.',
    },
    {
      ar: 'تضم مجموعة من العلامات والمشاريع الرياضية التي تقدّم خدمات متكاملة في مجالات البادل، كرة القدم، التنس، اللياقة البدنية والسباحة.',
      en: 'It brings together a portfolio of sports brands and projects delivering integrated services across padel, football, tennis, fitness and swimming.',
    },
    {
      ar: 'تمتلك الشركة خبرة تشغيلية واسعة في إدارة الأقسام الرياضية، وتعتمد على كوادر متخصصة، ونظام حجز إلكتروني متطور، وقاعدة عملاء متنامية، مما جعلها من الشركات الرائدة في القطاع الرياضي داخل العراق.',
      en: 'Deep operational experience, specialist staff, an advanced digital booking system and a growing customer base have made it a leader in Iraq’s sports sector.',
    },
  ] satisfies Bi[],
}

/* --------------------------------------------------------------- divisions */

export type Division = {
  slug: string
  icon: string
  title: Bi
  kicker: Bi
  body: Bi
  /** poster / still used by the WebGL plane and the <img> fallback */
  image: string
  /** optional cinematic loop rendered from the same source still */
  video?: string
  meta: Bi[]
}

export const DIVISIONS: Division[] = [
  {
    slug: 'padel',
    icon: 'padel',
    title: { ar: 'ملاعب البادل', en: 'Padel courts' },
    kicker: { ar: 'رياضة سريعة الإيقاع ومنافسة اجتماعية', en: 'Fast-paced racket sport and social competition' },
    body: {
      ar: 'ملاعب بادل مجهّزة وفق أحدث المواصفات العالمية، تضم أكاديمية متخصصة للكبار والأطفال بإشراف مدربين محترفين، مع استضافة البطولات والفعاليات الرياضية.',
      en: 'Padel courts built to the latest international specifications, with a dedicated academy for adults and children under professional coaches, and a full calendar of tournaments and events.',
    },
    image: 'padel-courts',
    video: 'padel',
    meta: [
      { ar: 'أكاديمية للكبار والأطفال', en: 'Adult & junior academy' },
      { ar: 'بطولات وفعاليات', en: 'Tournaments & events' },
      { ar: 'مواصفات عالمية', en: 'International spec' },
    ],
  },
  {
    slug: 'gym',
    icon: 'gym',
    title: { ar: 'الصالة الرياضية', en: 'Gym' },
    kicker: { ar: 'القوة والتكييف البدني والأداء', en: 'Strength, conditioning and performance' },
    body: {
      ar: 'صالة رياضية متكاملة تضم أحدث الأجهزة الرياضية، مع برامج تدريبية متنوعة بإشراف مدربين مختصين.',
      en: 'A complete fitness floor equipped with the latest machines, running a varied programme of training under specialist coaches.',
    },
    image: 'gym-interior',
    video: 'gym',
    meta: [
      { ar: 'أحدث الأجهزة', en: 'Latest equipment' },
      { ar: 'برامج تدريبية متنوعة', en: 'Varied programmes' },
      { ar: 'مدربون مختصون', en: 'Specialist coaches' },
    ],
  },
  {
    slug: 'swimming',
    icon: 'swimming',
    title: { ar: 'المسبح', en: 'Swimming pool' },
    kicker: { ar: 'الحركة المائية والتدريب والاستجمام', en: 'Aquatic movement, training and recreation' },
    body: {
      ar: 'مسبح حديث يضم أكاديمية سباحة للكبار والأطفال، بالإضافة إلى أوقات مخصصة للرجال وأخرى للنساء، لتوفير تجربة تناسب مختلف الفئات.',
      en: 'A modern pool with a swimming academy for adults and children, plus dedicated men’s and women’s sessions so the experience suits everyone.',
    },
    image: 'pool',
    video: 'pool',
    meta: [
      { ar: 'أكاديمية سباحة', en: 'Swim academy' },
      { ar: 'أوقات مخصصة', en: 'Dedicated sessions' },
      { ar: 'جاكوزي وساونا', en: 'Jacuzzi & sauna' },
    ],
  },
  {
    slug: 'tennis',
    icon: 'tennis',
    title: { ar: 'ملاعب التنس', en: 'Tennis courts' },
    kicker: { ar: 'الدقة والحركة واللعب التنافسي', en: 'Precision, movement and competitive play' },
    body: {
      ar: 'ملاعب مجهّزة لاستقبال اللاعبين الهواة والمحترفين، مع إمكانية إقامة البطولات والدورات التدريبية.',
      en: 'Courts equipped for amateurs and professionals alike, ready to host tournaments and coaching clinics.',
    },
    image: 'tennis-court',
    meta: [
      { ar: 'هواة ومحترفون', en: 'Amateur & pro' },
      { ar: 'بطولات', en: 'Tournaments' },
      { ar: 'دورات تدريبية', en: 'Training courses' },
    ],
  },
  {
    slug: 'football',
    icon: 'football',
    title: { ar: 'ملاعب كرة القدم', en: 'Football pitches' },
    kicker: { ar: 'لعبة العالم — الفريق والطاقة والمجتمع', en: 'The world’s game — teamwork, energy and community' },
    body: {
      ar: 'ملاعب كرة قدم بمواصفات احترافية تستوعب الفرق والدوريات والتدريبات اليومية، ضمن منظومة تشغيل متكاملة.',
      en: 'Professional-grade pitches for teams, leagues and daily training, run inside one integrated operating system.',
    },
    image: 'football-pitch',
    video: 'football',
    meta: [
      { ar: 'دوريات وفرق', en: 'Leagues & teams' },
      { ar: 'تدريب يومي', en: 'Daily training' },
      { ar: 'إضاءة ليلية', en: 'Floodlit' },
    ],
  },
  {
    slug: 'basketball',
    icon: 'basketball',
    title: { ar: 'كرة السلة', en: 'Basketball' },
    kicker: { ar: 'اللعب الجماعي والسرعة وأداء الملعب', en: 'Team play, speed and court performance' },
    body: {
      ar: 'ملعب كرة سلة ضمن منظومة الأيقونات الرياضية الستّ للمجموعة، مهيّأ للتدريب والمباريات المجتمعية.',
      en: 'A basketball court completing the group’s six-sport icon system, set up for training and community fixtures.',
    },
    image: 'aerial-complex',
    meta: [
      { ar: 'مباريات مجتمعية', en: 'Community fixtures' },
      { ar: 'تدريب', en: 'Training' },
      { ar: 'ضمن المجمّع', en: 'Inside the complex' },
    ],
  },
]

/* ---------------------------------------------------------------- branches */

export type Branch = {
  slug: string
  name: Bi
  /** normalised position on the Baghdad map artwork, 0–1 from the left / top */
  map: { x: number; y: number }
  facilities: Bi[]
}

export const BRANCHES: Branch[] = [
  {
    slug: 'nakheel',
    name: { ar: 'مجمع نخيل بغداد', en: 'Nakheel Baghdad Mall' },
    map: { x: 0.62, y: 0.3 },
    facilities: [
      { ar: '٣ ملاعب بادل', en: '3 padel courts' },
      { ar: 'صالة ألعاب رياضية', en: 'Gym' },
      { ar: 'مسبح (جاكوزي — ساونا)', en: 'Pool (jacuzzi & sauna)' },
    ],
  },
  {
    slug: 'zayouna',
    name: { ar: 'زيونة', en: 'Zayouna' },
    map: { x: 0.7, y: 0.52 },
    facilities: [{ ar: 'ملعبا بادل', en: '2 padel courts' }],
  },
  {
    slug: 'ilam',
    name: { ar: 'حي الإعلام', en: 'Hay Al-I‘lam' },
    map: { x: 0.34, y: 0.44 },
    facilities: [{ ar: 'صالة ألعاب رياضية', en: 'Gym' }],
  },
  {
    slug: 'palestine',
    name: { ar: 'شارع فلسطين', en: 'Palestine Street' },
    map: { x: 0.55, y: 0.62 },
    facilities: [{ ar: '٣ ملاعب بادل', en: '3 padel courts' }],
  },
]

/* ------------------------------------------------------------------- stats */

export type Stat = {
  value: number
  suffix?: string
  prefix?: Bi
  label: Bi
}

export const STATS: Stat[] = [
  {
    value: 7000,
    suffix: '+',
    label: { ar: 'مستخدم مسجّل في تطبيق PADEL', en: 'Registered users on the PADEL app' },
  },
  {
    value: 1100,
    suffix: '+',
    label: { ar: 'قاعدة عملاء في الصالات الرياضية', en: 'Gym customer base' },
  },
  {
    value: 800,
    label: { ar: 'مشترك في جيم النخيل', en: 'Members at Nakheel gym' },
  },
  {
    value: 300,
    label: { ar: 'مشترك في جيم حي الإعلام', en: 'Members at Hay Al-I‘lam gym' },
  },
  {
    value: 500,
    suffix: '+',
    label: { ar: 'مستخدم نشط', en: 'Active users' },
  },
  {
    value: 4,
    label: { ar: 'فروع PADEL IQ في العراق', en: 'PADEL IQ branches in Iraq' },
  },
]

export const RUSH_HOURS = {
  label: { ar: 'ساعات الذروة', en: 'Rush hours' } satisfies Bi,
  value: '4 AM — 4 PM',
}

/* -------------------------------------------------------------------- team */

export type Person = { slug: string; name: Bi; role: Bi; photo: string }

export const TEAM: Person[] = [
  {
    slug: 'ali',
    name: { ar: 'كوتش علي سمير فرج', en: 'Coach Ali Samir Faraj' },
    role: { ar: 'مدرب البادل', en: 'Padel coach' },
    photo: 'coach-ali',
  },
  {
    slug: 'ammar',
    name: { ar: 'كابتن عمار أيسر خضور', en: 'Captain Ammar Ayser Khadour' },
    role: { ar: 'مدرب الملاكمة', en: 'Boxing coach' },
    photo: 'coach-ammar',
  },
  {
    slug: 'yousif',
    name: { ar: 'كابتن يوسف وائل ملحم', en: 'Captain Yousif Wael Melhem' },
    role: { ar: 'مدرب كمال الأجسام', en: 'Bodybuilding coach' },
    photo: 'coach-yousif',
  },
]

export const TEAM_SUMMARY = {
  branch: { ar: 'فرع النخيل', en: 'Nakheel branch' } satisfies Bi,
  rows: [
    { label: { ar: 'قسم التسويق', en: 'Marketing department' }, value: { ar: '٦ موظفين', en: '6 staff' } },
    { label: { ar: 'فريق التدريب', en: 'Coaching team' }, value: { ar: '٤ مدربين محترفين', en: '4 professional coaches' } },
  ] as { label: Bi; value: Bi }[],
}

/* ------------------------------------------------------------------ why us */

export const WHY: { n: string; title: Bi; body: Bi }[] = [
  {
    n: '01',
    title: { ar: 'فريق متخصص', en: 'A specialist team' },
    body: {
      ar: 'في التسويق، وإدارة الفعاليات، وتشغيل الأكاديميات الرياضية.',
      en: 'Across marketing, event management and sports-academy operations.',
    },
  },
  {
    n: '02',
    title: { ar: 'خبرة تشغيلية ناجحة', en: 'Proven operations' },
    body: {
      ar: 'سجل ناجح في إدارة المجمعات الرياضية داخل العراق.',
      en: 'A successful record running sports complexes inside Iraq.',
    },
  },
  {
    n: '03',
    title: { ar: 'أكثر من ٧٬٠٠٠ مستخدم', en: 'Over 7,000 users' },
    body: {
      ar: 'على تطبيق PADEL، وأكثر من ٥٠٠ مستخدم نشط.',
      en: 'On the PADEL app, with more than 500 of them active.',
    },
  },
  {
    n: '04',
    title: { ar: 'قاعدة عملاء واسعة', en: 'A broad customer base' },
    body: {
      ar: 'أكثر من ١٬١٠٠ عميل في الصالات الرياضية.',
      en: 'More than 1,100 customers across the gyms.',
    },
  },
  {
    n: '05',
    title: { ar: 'نظام حجز إلكتروني متطور', en: 'Advanced digital booking' },
    body: {
      ar: 'حجز فوري للملاعب والحصص عبر التطبيق.',
      en: 'Instant court and class booking through the app.',
    },
  },
]

/* ------------------------------------------------------------------ vision */

export const VISION = {
  eyebrow: { ar: 'الرؤية', en: 'Vision' } satisfies Bi,
  body: {
    ar: 'أن تصبح المجموعة الرياضية الأولى في العراق، من خلال تقديم تجربة متكاملة تجمع بين الرياضة، الصحة، الترفيه، والأكاديميات الاحترافية، وفق أعلى معايير الجودة.',
    en: 'To become the leading sports group in Iraq by delivering one integrated experience across sport, health, leisure and professional academies — held to the highest standards of quality.',
  } satisfies Bi,
}

/* ----------------------------------------------------------------- contact */

export const CONTACT = {
  eyebrow: { ar: 'تواصل معنا', en: 'Get in touch' } satisfies Bi,
  title: { ar: 'احجز ملعبك الآن', en: 'Book your court' } satisfies Bi,
  body: {
    ar: 'نظام حجز إلكتروني متطور يتيح لك حجز الملاعب والحصص التدريبية خلال ثوانٍ.',
    en: 'An advanced booking system that puts courts and coaching sessions a few seconds away.',
  } satisfies Bi,
  email: 'info@iqsportsgroup.iq',
  phone: '+964 770 000 0000',
  address: { ar: 'مجمع نخيل بغداد، بغداد، العراق', en: 'Nakheel Baghdad Mall, Baghdad, Iraq' } satisfies Bi,
  socials: [
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'Facebook', href: 'https://facebook.com/' },
    { label: 'WhatsApp', href: 'https://wa.me/' },
  ],
}

/* -------------------------------------------------------------- navigation */

export const NAV: { id: string; label: Bi }[] = [
  { id: 'about', label: { ar: 'من نحن', en: 'About' } },
  { id: 'divisions', label: { ar: 'الأقسام', en: 'Divisions' } },
  { id: 'branches', label: { ar: 'الفروع', en: 'Branches' } },
  { id: 'numbers', label: { ar: 'الأرقام', en: 'Numbers' } },
  { id: 'team', label: { ar: 'الفريق', en: 'Team' } },
  { id: 'vision', label: { ar: 'الرؤية', en: 'Vision' } },
  { id: 'contact', label: { ar: 'تواصل', en: 'Contact' } },
]

/* ------------------------------------------------------------------- misc */

export const UI = {
  loading: { ar: 'جارٍ التحميل', en: 'Loading' } satisfies Bi,
  enter: { ar: 'ادخل التجربة', en: 'Enter experience' } satisfies Bi,
  scroll: { ar: 'مرّر للأسفل', en: 'Scroll' } satisfies Bi,
  menu: { ar: 'القائمة', en: 'Menu' } satisfies Bi,
  close: { ar: 'إغلاق', en: 'Close' } satisfies Bi,
  skip: { ar: 'تخطٍّ إلى المحتوى', en: 'Skip to content' } satisfies Bi,
  book: { ar: 'احجز الآن', en: 'Book now' } satisfies Bi,
  rights: { ar: 'جميع الحقوق محفوظة', en: 'All rights reserved' } satisfies Bi,
  established: { ar: 'بغداد — العراق', en: 'Baghdad — Iraq' } satisfies Bi,
}
