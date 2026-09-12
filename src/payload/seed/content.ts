/**
 * Initial content for the CMS — everything the site launches with.
 *
 * All copy and figures are transcribed from the two supplied brand documents
 * ("مجموعة العراق الرياضية.pdf" company profile and the brand guideline).
 * Once seeded, this file is no longer read: the CMS database is the source of
 * truth and editors change content from /admin.
 */

export type Bi = { ar: string; en: string }
const bi = (ar: string, en: string): Bi => ({ ar, en })

/* --------------------------------------------------------------- media */

export const MEDIA: Record<string, { file: string; alt: Bi }> = {
  'aerial-complex': {
    file: 'public/img/aerial-complex.jpg',
    alt: bi('لقطة جوية لمجمع مجموعة العراق الرياضية', 'Aerial view of the IQ Sports Group complex'),
  },
  'padel-courts': { file: 'public/img/padel-courts.jpg', alt: bi('ملاعب البادل', 'Padel courts') },
  'gym-interior': { file: 'public/img/gym-interior.jpg', alt: bi('الصالة الرياضية من الداخل', 'Inside the gym') },
  pool: { file: 'public/img/pool.jpg', alt: bi('المسبح', 'The swimming pool') },
  'tennis-court': { file: 'public/img/tennis-court.jpg', alt: bi('ملعب التنس', 'Tennis court') },
  'tennis-serve': { file: 'public/img/tennis-serve.jpg', alt: bi('لاعب تنس أثناء الإرسال', 'Tennis player serving') },
  'football-pitch': { file: 'public/img/football-pitch.jpg', alt: bi('ملعب كرة القدم', 'Football pitch') },
  'baghdad-map': { file: 'public/img/baghdad-map.jpg', alt: bi('خريطة بغداد', 'Map of Baghdad') },
  'hud-rings': { file: 'public/img/hud-rings.jpg', alt: bi('رسم بياني دائري', 'Abstract data rings') },
  'coach-ali': { file: 'public/img/coach-ali.jpg', alt: bi('كوتش علي سمير فرج', 'Coach Ali Samir Faraj') },
  'coach-ammar': { file: 'public/img/coach-ammar.jpg', alt: bi('كابتن عمار أيسر خضور', 'Captain Ammar Ayser Khadour') },
  'coach-yousif': { file: 'public/img/coach-yousif.jpg', alt: bi('كابتن يوسف وائل ملحم', 'Captain Yousif Wael Melhem') },
  'og-default': {
    file: 'public/og-default.jpg',
    alt: bi('مجموعة العراق الرياضية — IQ Sports Group', 'IQ Sports Group'),
  },
}

/* ------------------------------------------------------------ settings */

export const SETTINGS = {
  siteName: bi('مجموعة العراق الرياضية', 'IQ Sports Group'),
  shortName: bi('العراق الرياضية', 'IQ Sports'),
  tagline: bi('وجهة رياضية موحّدة', 'A unified sports destination'),
  phone: '+964 770 000 0000',
  whatsapp: '9647700000000',
  email: 'info@iqsportsgroup.iq',
  address: bi('مجمع نخيل بغداد، بغداد، العراق', 'Nakheel Baghdad Mall, Baghdad, Iraq'),
  city: bi('بغداد', 'Baghdad'),
  country: bi('العراق', 'Iraq'),
  mapsUrl: 'https://maps.google.com/?q=Nakheel+Mall+Baghdad',
  hours: bi('يومياً من ٤ صباحاً حتى ١٢ منتصف الليل', 'Daily, 4 AM to midnight'),
  socials: [
    { platform: 'instagram', url: 'https://instagram.com/' },
    { platform: 'facebook', url: 'https://facebook.com/' },
    { platform: 'whatsapp', url: 'https://wa.me/9647700000000' },
  ],
  nav: [
    { page: 'divisions', label: bi('الأقسام', 'Divisions') },
    { page: 'branches', label: bi('الفروع', 'Branches') },
    { page: 'statistics', label: bi('الإحصائيات', 'Statistics') },
    { page: 'team', label: bi('الكادر التدريبي', 'Coaching staff') },
    { page: 'tournaments', label: bi('البطولات والدورات', 'Tournaments') },
    { page: 'vision', label: bi('الرؤية', 'Vision') },
    { page: 'contact', label: bi('تواصل معنا', 'Contact') },
  ],
  footerText: bi(
    'تجمع بين تخصصات رياضية متعددة تحت هوية معاصرة واحدة، محورها الحركة وطاقة المجتمع والأداء.',
    'Bringing multiple disciplines together under one contemporary identity focused on movement, community energy and performance.',
  ),
  copyright: bi('مجموعة العراق الرياضية — جميع الحقوق محفوظة', 'IQ Sports Group — All rights reserved'),
  siteUrl: 'https://iqsportsgroup.iq',
  defaultTitle: bi('مجموعة العراق الرياضية | IQ Sports Group', 'IQ Sports Group | مجموعة العراق الرياضية'),
  defaultDescription: bi(
    'شركة عراقية متخصصة، الأولى من نوعها، في إنشاء وإدارة وتشغيل الأقسام والأكاديميات الرياضية: البادل، كرة القدم، التنس، اللياقة البدنية والسباحة — بأربعة فروع في بغداد.',
    'The first Iraqi company of its kind building, managing and operating sports facilities and academies — padel, football, tennis, fitness and swimming — across four branches in Baghdad.',
  ),
  keywords: [
    bi('مجموعة العراق الرياضية', 'IQ Sports Group'),
    bi('بادل بغداد', 'padel Baghdad'),
    bi('PADEL IQ', 'PADEL IQ'),
    bi('جيم بغداد', 'gym Baghdad'),
    bi('أكاديمية رياضية في العراق', 'sports academy Iraq'),
    bi('ملاعب كرة قدم بغداد', 'football pitches Baghdad'),
    bi('مسبح بغداد', 'swimming pool Baghdad'),
  ],
}

/* ---------------------------------------------------------------- home */

export const HOME = {
  hero: {
    title: bi('مجموعة العراق الرياضية', 'IQ Sports Group'),
    subtitle: bi(
      'الأولى في العراق من نوعها في إنشاء وإدارة وتشغيل الأقسام والأكاديميات الرياضية.',
      'The first of its kind in Iraq — building, managing and operating sports facilities and academies.',
    ),
    background: 'aerial-complex',
    primaryCta: { label: bi('احجز الآن', 'Book now'), target: 'contact' },
    secondaryCta: { label: bi('تعرّف على أقسامنا', 'Explore our divisions'), target: 'divisions' },
  },
  about: {
    eyebrow: bi('نبذة عنّا', 'About us'),
    title: bi('الأولى في العراق من نوعها', 'The first of its kind in Iraq'),
    paragraphs: [
      bi(
        'شركة عراقية متخصصة، الأولى في العراق من نوعها، في إنشاء وإدارة وتشغيل الأقسام والأكاديميات الرياضية.',
        'An Iraqi company — the first of its kind in the country — specialised in building, managing and operating sports facilities and academies.',
      ),
      bi(
        'تضم مجموعة من العلامات والمشاريع الرياضية التي تقدّم خدمات متكاملة في مجالات البادل، كرة القدم، التنس، اللياقة البدنية والسباحة.',
        'It brings together a portfolio of sports brands and projects delivering integrated services across padel, football, tennis, fitness and swimming.',
      ),
      bi(
        'تمتلك الشركة خبرة تشغيلية واسعة في إدارة الأقسام الرياضية، وتعتمد على كوادر متخصصة، ونظام حجز إلكتروني متطور، وقاعدة عملاء متنامية، مما جعلها من الشركات الرائدة في القطاع الرياضي داخل العراق.',
        'Deep operational experience, specialist staff, an advanced digital booking system and a growing customer base have made it a leader in Iraq’s sports sector.',
      ),
    ],
    image: 'football-pitch',
    pillars: [bi('الحركة', 'Movement'), bi('المجتمع', 'Community'), bi('الأداء', 'Performance'), bi('الطاقة', 'Energy')],
  },
  sections: {
    eyebrow: bi('اكتشف المجموعة', 'Explore the group'),
    title: bi('كل ما تريد معرفته في مكان واحد', 'Everything you need to know, in one place'),
    intro: bi('اختر قسماً للاطّلاع على التفاصيل.', 'Pick a section to see the details.'),
    tiles: [
      { page: 'divisions', title: bi('الأقسام', 'Divisions'), blurb: bi('ملاعب البادل، كرة السلة، التنس، كرة القدم، الصالة الرياضية والمسبح', 'Padel, basketball, tennis, football, gym and pool'), image: 'padel-courts' },
      { page: 'branches', title: bi('الفروع', 'Branches'), blurb: bi('أربعة فروع على خريطة بغداد', 'Four branches on the Baghdad map'), image: 'baghdad-map' },
      { page: 'statistics', title: bi('الإحصائيات', 'Statistics'), blurb: bi('أرقام تنمو كل يوم', 'Numbers that grow every day'), image: 'hud-rings' },
      { page: 'team', title: bi('الكادر التدريبي', 'Coaching staff'), blurb: bi('مدربون محترفون في كل تخصص', 'Professional coaches in every discipline'), image: 'gym-interior' },
      { page: 'vision', title: bi('الرؤية', 'Vision'), blurb: bi('إلى أين نتّجه', 'Where we are heading'), image: 'aerial-complex' },
      { page: 'tournaments', title: bi('البطولات والدورات التدريبية', 'Tournaments & courses'), blurb: bi('البطولات السابقة والدورات القادمة', 'Past tournaments and upcoming courses'), image: 'tennis-court' },
    ],
  },
  contact: {
    eyebrow: bi('تواصل معنا', 'Get in touch'),
    title: bi('احجز ملعبك الآن', 'Book your court'),
    body: bi(
      'نظام حجز إلكتروني متطور يتيح لك حجز الملاعب والحصص التدريبية خلال ثوانٍ.',
      'An advanced booking system that puts courts and coaching sessions a few seconds away.',
    ),
    formIntro: bi('املأ الطلب وسنعاود التواصل معك لتأكيد الحجز.', 'Fill in the request and we will come back to you to confirm.'),
    successMessage: bi('وصلنا طلبك. سنتواصل معك قريباً لتأكيد الحجز.', 'We received your request and will contact you shortly to confirm.'),
    note: bi(
      'ساعات الذروة في الصالات من ٤ صباحاً حتى ٤ مساءً. الحجز عبر التطبيق متاح على مدار الساعة.',
      'Peak gym hours run 4 AM to 4 PM. App booking is open around the clock.',
    ),
  },
  meta: {
    title: bi('مجموعة العراق الرياضية | IQ Sports Group', 'IQ Sports Group | مجموعة العراق الرياضية'),
    description: SETTINGS.defaultDescription,
  },
}

/* ------------------------------------------------------------ branches */

export const BRANCHES = [
  {
    slug: 'nakheel',
    order: 1,
    title: bi('مجمع نخيل بغداد', 'Nakheel Baghdad Mall'),
    area: bi('بغداد', 'Baghdad'),
    address: bi('مجمع نخيل بغداد، بغداد', 'Nakheel Baghdad Mall, Baghdad'),
    facilities: [bi('٣ ملاعب بادل', '3 padel courts'), bi('صالة ألعاب رياضية', 'Gym'), bi('مسبح (جاكوزي — ساونا)', 'Pool (jacuzzi & sauna)')],
    mapPosition: { x: 62, y: 30 },
    image: 'padel-courts',
  },
  {
    slug: 'zayouna',
    order: 2,
    title: bi('زيونة', 'Zayouna'),
    area: bi('بغداد', 'Baghdad'),
    address: bi('زيونة، بغداد', 'Zayouna, Baghdad'),
    facilities: [bi('ملعبا بادل', '2 padel courts')],
    mapPosition: { x: 70, y: 52 },
  },
  {
    slug: 'ilam',
    order: 3,
    title: bi('حي الإعلام', 'Hay Al-I‘lam'),
    area: bi('بغداد', 'Baghdad'),
    address: bi('حي الإعلام، بغداد', 'Hay Al-I‘lam, Baghdad'),
    facilities: [bi('صالة ألعاب رياضية', 'Gym')],
    mapPosition: { x: 34, y: 44 },
    image: 'gym-interior',
  },
  {
    slug: 'palestine',
    order: 4,
    title: bi('شارع فلسطين', 'Palestine Street'),
    area: bi('بغداد', 'Baghdad'),
    address: bi('شارع فلسطين، بغداد', 'Palestine Street, Baghdad'),
    facilities: [bi('٣ ملاعب بادل', '3 padel courts')],
    mapPosition: { x: 55, y: 62 },
  },
]

/* ------------------------------------------------------------- coaches */

export const COACHES = [
  { key: 'ali', order: 1, name: bi('كوتش علي سمير فرج', 'Coach Ali Samir Faraj'), role: bi('مدرب البادل', 'Padel coach'), photo: 'coach-ali', division: 'padel', branch: 'nakheel' },
  { key: 'ammar', order: 2, name: bi('كابتن عمار أيسر خضور', 'Captain Ammar Ayser Khadour'), role: bi('مدرب الملاكمة', 'Boxing coach'), photo: 'coach-ammar', division: 'gym', branch: 'nakheel' },
  { key: 'yousif', order: 3, name: bi('كابتن يوسف وائل ملحم', 'Captain Yousif Wael Melhem'), role: bi('مدرب كمال الأجسام', 'Bodybuilding coach'), photo: 'coach-yousif', division: 'gym', branch: 'nakheel' },
]

/* ----------------------------------------------------------- divisions */

type DivisionSeed = {
  slug: string
  order: number
  icon: string
  title: Bi
  kicker: Bi
  summary: Bi
  lede: Bi
  image: string
  story: Bi[]
  features: { title: Bi; body: Bi }[]
  highlights: Bi[]
  branches: string[]
  coaches: string[]
  figure?: { value: number; suffix?: string; label: Bi }
}

export const DIVISIONS: DivisionSeed[] = [
  {
    slug: 'padel',
    order: 1,
    icon: 'padel',
    title: bi('ملاعب البادل', 'Padel courts'),
    kicker: bi('رياضة سريعة الإيقاع ومنافسة اجتماعية', 'Fast-paced racket sport and social competition'),
    summary: bi(
      'ملاعب بادل مجهّزة وفق أحدث المواصفات العالمية، تضم أكاديمية متخصصة للكبار والأطفال بإشراف مدربين محترفين، مع استضافة البطولات والفعاليات الرياضية.',
      'Padel courts built to the latest international specifications, with a dedicated academy for adults and children under professional coaches, and a full calendar of tournaments and events.',
    ),
    lede: bi('ثمانية ملاعب في ثلاثة فروع، وأكاديمية تبدأ من الأطفال وتصل إلى البطولات.', 'Eight courts across three branches, and an academy that runs from juniors to tournament play.'),
    image: 'padel-courts',
    story: [
      bi('PADEL IQ هي العلامة التي انطلقت منها المجموعة، وهي اليوم أكبر شبكة ملاعب بادل في العراق: ثلاثة ملاعب في مجمع نخيل بغداد، ملعبان في زيونة، وثلاثة في شارع فلسطين.', 'PADEL IQ is the brand the group grew out of, and today it is the largest padel network in Iraq: three courts at Nakheel Baghdad Mall, two in Zayouna and three on Palestine Street.'),
      bi('الملاعب مجهّزة وفق أحدث المواصفات العالمية، والأكاديمية تعمل بإشراف مدربين محترفين لفئتي الكبار والأطفال، مع تقويم منتظم من البطولات والفعاليات.', 'The courts are built to the latest international specifications, and the academy runs under professional coaches for both adults and children, with a regular calendar of tournaments and events.'),
      bi('أكثر من سبعة آلاف مستخدم مسجّل في التطبيق يحجزون ملاعبهم خلال ثوانٍ، وأكثر من خمسمئة منهم يلعبون بانتظام.', 'More than seven thousand registered users book their courts through the app in seconds, and more than five hundred of them play regularly.'),
    ],
    features: [
      { title: bi('مواصفات عالمية', 'International spec'), body: bi('أرضيات وزجاج وإضاءة وفق أحدث المعايير الدولية للعبة.', 'Turf, glass and lighting to the latest international standard for the game.') },
      { title: bi('أكاديمية للكبار والأطفال', 'Adult & junior academy'), body: bi('مسارات تدريب منفصلة بإشراف مدربين محترفين.', 'Separate coaching tracks under professional coaches.') },
      { title: bi('بطولات وفعاليات', 'Tournaments & events'), body: bi('استضافة بطولات وفعاليات رياضية على مدار الموسم.', 'Tournaments and sporting events hosted through the season.') },
      { title: bi('حجز فوري', 'Instant booking'), body: bi('نظام حجز إلكتروني متطور عبر تطبيق PADEL IQ.', 'An advanced booking system through the PADEL IQ app.') },
    ],
    highlights: [bi('أكاديمية للكبار والأطفال', 'Adult & junior academy'), bi('بطولات وفعاليات', 'Tournaments & events'), bi('مواصفات عالمية', 'International spec')],
    branches: ['nakheel', 'zayouna', 'palestine'],
    coaches: ['ali'],
    figure: { value: 7000, suffix: '+', label: bi('مستخدم مسجّل في التطبيق', 'registered app users') },
  },
  {
    slug: 'basketball',
    order: 2,
    icon: 'basketball',
    title: bi('كرة السلة', 'Basketball'),
    kicker: bi('اللعب الجماعي والسرعة وأداء الملعب', 'Team play, speed and court performance'),
    summary: bi(
      'ملعب كرة سلة ضمن منظومة الأيقونات الرياضية الستّ للمجموعة، مهيّأ للتدريب والمباريات المجتمعية.',
      'A basketball court completing the group’s six-sport icon system, set up for training and community fixtures.',
    ),
    lede: bi('اللعب الجماعي والسرعة وأداء الملعب — ضمن منظومة الرياضات الستّ.', 'Team play, speed and court performance — part of the six-sport system.'),
    image: 'aerial-complex',
    story: [
      bi('كرة السلة تُكمل منظومة الأيقونات الرياضية الستّ للمجموعة: رياضة جماعية سريعة الإيقاع، مهيّأة للتدريب والمباريات المجتمعية داخل المجمّع.', 'Basketball completes the group’s six-sport icon system: a fast, team-first game set up for training and community fixtures inside the complex.'),
      bi('الملعب جزء من المجمّع نفسه الذي يضم المسار والملاعب والصالة، فيتنقّل اللاعب بين الرياضات دون أن يغادر المكان.', 'The court sits inside the same complex as the track, the courts and the gym, so a player can move between sports without leaving the grounds.'),
    ],
    features: [
      { title: bi('مباريات مجتمعية', 'Community fixtures'), body: bi('لقاءات دورية مفتوحة.', 'Regular open fixtures.') },
      { title: bi('تدريب', 'Training'), body: bi('حصص للفرق والأفراد.', 'Sessions for teams and individuals.') },
      { title: bi('ضمن المجمّع', 'Inside the complex'), body: bi('إلى جانب باقي الأقسام.', 'Alongside the other divisions.') },
      { title: bi('حجز بالتطبيق', 'App booking'), body: bi('عبر نظام الحجز الموحّد.', 'Through the unified booking system.') },
    ],
    highlights: [bi('مباريات مجتمعية', 'Community fixtures'), bi('تدريب', 'Training'), bi('ضمن المجمّع', 'Inside the complex')],
    branches: [],
    coaches: [],
  },
  {
    slug: 'tennis',
    order: 3,
    icon: 'tennis',
    title: bi('ملاعب التنس', 'Tennis courts'),
    kicker: bi('الدقة والحركة واللعب التنافسي', 'Precision, movement and competitive play'),
    summary: bi(
      'ملاعب مجهّزة لاستقبال اللاعبين الهواة والمحترفين، مع إمكانية إقامة البطولات والدورات التدريبية.',
      'Courts equipped for amateurs and professionals alike, ready to host tournaments and coaching clinics.',
    ),
    lede: bi('ملاعب للهواة والمحترفين، تستضيف البطولات والدورات التدريبية.', 'Courts for amateurs and professionals, hosting tournaments and coaching clinics.'),
    image: 'tennis-court',
    story: [
      bi('ملاعب مجهّزة لاستقبال اللاعبين الهواة والمحترفين، مع إمكانية إقامة البطولات والدورات التدريبية.', 'Courts equipped for amateurs and professionals alike, ready to host tournaments and coaching clinics.'),
      bi('التنس هو الرياضة التي تختبر الدقة قبل القوة: خط واحد يفصل النقطة عن الخطأ، ولهذا صُمّمت الملاعب لتمنح اللاعب سطحاً ثابتاً وإضاءة متساوية في كل زاوية.', 'Tennis tests precision before power: a single line separates the point from the fault, which is why the courts are built to give the player a consistent surface and even light in every corner.'),
    ],
    features: [
      { title: bi('هواة ومحترفون', 'Amateur & pro'), body: bi('مستويات لعب متعددة على الملعب نفسه.', 'Multiple levels of play on the same court.') },
      { title: bi('بطولات', 'Tournaments'), body: bi('استضافة بطولات محلية.', 'Hosting local tournaments.') },
      { title: bi('دورات تدريبية', 'Training courses'), body: bi('برامج قصيرة ومكثفة.', 'Short, intensive programmes.') },
      { title: bi('إضاءة ليلية', 'Floodlit'), body: bi('لعب مسائي بإضاءة متساوية.', 'Evening play under even light.') },
    ],
    highlights: [bi('هواة ومحترفون', 'Amateur & pro'), bi('بطولات', 'Tournaments'), bi('دورات تدريبية', 'Training courses')],
    branches: [],
    coaches: [],
  },
  {
    slug: 'football',
    order: 4,
    icon: 'football',
    title: bi('ملاعب كرة القدم', 'Football pitches'),
    kicker: bi('لعبة العالم — الفريق والطاقة والمجتمع', 'The world’s game — teamwork, energy and community'),
    summary: bi(
      'ملاعب كرة قدم بمواصفات احترافية تستوعب الفرق والدوريات والتدريبات اليومية، ضمن منظومة تشغيل متكاملة.',
      'Professional-grade pitches for teams, leagues and daily training, run inside one integrated operating system.',
    ),
    lede: bi('ملاعب بمواصفات احترافية للفرق والدوريات والتدريب اليومي.', 'Professional-grade pitches for teams, leagues and daily training.'),
    image: 'football-pitch',
    story: [
      bi('ملاعب كرة قدم بمواصفات احترافية تستوعب الفرق والدوريات والتدريبات اليومية، ضمن منظومة تشغيل متكاملة تدير الحجز والجدولة والفعاليات.', 'Professional-grade football pitches for teams, leagues and daily training, inside one integrated operating system that handles booking, scheduling and events.'),
      bi('لعبة العالم — الفريق والطاقة والمجتمع. الملاعب مصمّمة بعشب صناعي ومدرجات جانبية وإضاءة كاشفة تسمح باللعب حتى ساعات الليل.', 'The world’s game — teamwork, energy and community. The pitches are built with artificial turf, side seating and floodlights that keep play going into the night.'),
    ],
    features: [
      { title: bi('دوريات وفرق', 'Leagues & teams'), body: bi('تنظيم دوريات وحجز جماعي.', 'League organisation and team bookings.') },
      { title: bi('تدريب يومي', 'Daily training'), body: bi('حصص ثابتة للفرق والأكاديميات.', 'Fixed slots for teams and academies.') },
      { title: bi('عشب صناعي', 'Artificial turf'), body: bi('سطح ثابت في كل الفصول.', 'A consistent surface all year.') },
      { title: bi('إضاءة كاشفة', 'Floodlights'), body: bi('لعب ليلي كامل.', 'Full night play.') },
    ],
    highlights: [bi('دوريات وفرق', 'Leagues & teams'), bi('تدريب يومي', 'Daily training'), bi('إضاءة ليلية', 'Floodlit')],
    branches: [],
    coaches: [],
  },
  {
    slug: 'gym',
    order: 5,
    icon: 'gym',
    title: bi('الصالة الرياضية', 'Gym'),
    kicker: bi('القوة والتكييف البدني والأداء', 'Strength, conditioning and performance'),
    summary: bi(
      'صالة رياضية متكاملة تضم أحدث الأجهزة الرياضية، مع برامج تدريبية متنوعة بإشراف مدربين مختصين.',
      'A complete fitness floor equipped with the latest machines, running a varied programme of training under specialist coaches.',
    ),
    lede: bi('صالتان، أكثر من ألف ومئة مشترك، ومدرّبون مختصون في القوة والملاكمة.', 'Two floors, over eleven hundred members, and specialist coaches in strength and boxing.'),
    image: 'gym-interior',
    story: [
      bi('صالة رياضية متكاملة تضم أحدث الأجهزة الرياضية، مع برامج تدريبية متنوعة بإشراف مدربين مختصين.', 'A complete fitness floor with the latest equipment, running varied training programmes under specialist coaches.'),
      bi('تعمل المجموعة اليوم بصالتين: ثمانمئة مشترك في جيم النخيل، وثلاثمئة في جيم حي الإعلام — قاعدة عملاء تتجاوز الألف ومئة وتنمو كل شهر.', 'The group runs two gyms today: eight hundred members at Nakheel and three hundred at Hay Al-I‘lam — a customer base past eleven hundred and growing every month.'),
      bi('ساعات الذروة تمتد من الرابعة فجراً حتى الرابعة عصراً، والفريق التدريبي يضم مدرباً لكمال الأجسام وآخر للملاكمة.', 'Peak hours run from four in the morning to four in the afternoon, and the coaching team includes a bodybuilding coach and a boxing coach.'),
    ],
    features: [
      { title: bi('أحدث الأجهزة', 'Latest equipment'), body: bi('مناطق للقوة والكارديو والتدريب الوظيفي.', 'Strength, cardio and functional zones.') },
      { title: bi('برامج متنوعة', 'Varied programmes'), body: bi('خطط تدريب تناسب المبتدئ والمحترف.', 'Plans that suit beginners and athletes alike.') },
      { title: bi('كمال أجسام', 'Bodybuilding'), body: bi('إشراف مباشر من مدرب مختص.', 'Direct supervision from a specialist coach.') },
      { title: bi('ملاكمة', 'Boxing'), body: bi('حصص تدريب بإشراف كابتن ملاكمة.', 'Sessions led by a boxing captain.') },
    ],
    highlights: [bi('أحدث الأجهزة', 'Latest equipment'), bi('برامج تدريبية متنوعة', 'Varied programmes'), bi('مدربون مختصون', 'Specialist coaches')],
    branches: ['nakheel', 'ilam'],
    coaches: ['yousif', 'ammar'],
    figure: { value: 1100, suffix: '+', label: bi('مشترك في الصالات الرياضية', 'gym members') },
  },
  {
    slug: 'swimming',
    order: 6,
    icon: 'swimming',
    title: bi('المسبح', 'Swimming pool'),
    kicker: bi('الحركة المائية والتدريب والاستجمام', 'Aquatic movement, training and recreation'),
    summary: bi(
      'مسبح حديث يضم أكاديمية سباحة للكبار والأطفال، بالإضافة إلى أوقات مخصصة للرجال وأخرى للنساء، لتوفير تجربة تناسب مختلف الفئات.',
      'A modern pool with a swimming academy for adults and children, plus dedicated men’s and women’s sessions so the experience suits everyone.',
    ),
    lede: bi('مسبح حديث بأكاديمية سباحة، وأوقات مخصصة للرجال وأخرى للنساء.', 'A modern pool with a swimming academy, and dedicated men’s and women’s sessions.'),
    image: 'pool',
    story: [
      bi('مسبح حديث يضم أكاديمية سباحة للكبار والأطفال، بالإضافة إلى أوقات مخصصة للرجال وأخرى للنساء، لتوفير تجربة تناسب مختلف الفئات.', 'A modern pool with a swimming academy for adults and children, plus dedicated men’s and women’s sessions so the experience suits everyone.'),
      bi('في فرع مجمع نخيل بغداد يُكمل المسبحَ جاكوزي وساونا، فيتحول القسم من مكان للتدريب إلى مكان للاستشفاء أيضاً.', 'At the Nakheel Baghdad Mall branch a jacuzzi and sauna complete the pool, turning the division from a place to train into a place to recover as well.'),
    ],
    features: [
      { title: bi('أكاديمية سباحة', 'Swim academy'), body: bi('تعليم وتدريب للكبار والأطفال.', 'Lessons and training for adults and children.') },
      { title: bi('أوقات مخصصة', 'Dedicated sessions'), body: bi('جداول منفصلة للرجال والنساء.', 'Separate schedules for men and women.') },
      { title: bi('جاكوزي', 'Jacuzzi'), body: bi('للاسترخاء بعد التدريب.', 'To unwind after training.') },
      { title: bi('ساونا', 'Sauna'), body: bi('استشفاء عضلي في فرع النخيل.', 'Muscle recovery at the Nakheel branch.') },
    ],
    highlights: [bi('أكاديمية سباحة', 'Swim academy'), bi('أوقات مخصصة', 'Dedicated sessions'), bi('جاكوزي وساونا', 'Jacuzzi & sauna')],
    branches: ['nakheel'],
    coaches: [],
  },
]

/* --------------------------------------------------------------- pages */

export const PAGES = {
  divisions: {
    eyebrow: bi('الأقسام', 'Divisions'),
    title: bi('ستّ رياضات تحت هوية واحدة', 'Six sports, one identity'),
    intro: bi(
      'خدمات متكاملة في البادل، كرة السلة، التنس، كرة القدم، اللياقة البدنية والسباحة — كل قسم بمنشآته وأكاديميته ومدربيه.',
      'Integrated services across padel, basketball, tennis, football, fitness and swimming — each division with its own facilities, academy and coaches.',
    ),
    meta: { title: bi('الأقسام الرياضية', 'Sports divisions'), description: bi('ملاعب البادل، كرة السلة، التنس، كرة القدم، الصالة الرياضية والمسبح في مجموعة العراق الرياضية ببغداد.', 'Padel courts, basketball, tennis, football pitches, gym and swimming pool at IQ Sports Group in Baghdad.') },
  },
  branches: {
    eyebrow: bi('فروعنا', 'Our branches'),
    title: bi('أربعة فروع في بغداد', 'Four branches in Baghdad'),
    intro: bi('تدير مجموعة العراق الرياضية حالياً أربعة فروع من PADEL IQ في العراق.', 'IQ Sports Group currently operates four PADEL IQ branches across Iraq.'),
    mapImage: 'baghdad-map',
    mapCaption: bi('بغداد', 'Baghdad'),
    meta: { title: bi('الفروع', 'Branches'), description: bi('فروع مجموعة العراق الرياضية في بغداد: مجمع نخيل بغداد، زيونة، حي الإعلام، وشارع فلسطين.', 'IQ Sports Group branches in Baghdad: Nakheel Baghdad Mall, Zayouna, Hay Al-I‘lam and Palestine Street.') },
  },
  statistics: {
    eyebrow: bi('الإحصائيات', 'Statistics'),
    title: bi('قاعدة تنمو كل يوم', 'A base that grows daily'),
    intro: bi('أرقام مجموعة العراق الرياضية كما وردت في ملف الشركة.', 'IQ Sports Group in numbers, as stated in the company profile.'),
    stats: [
      { value: 7000, suffix: '+', label: bi('مستخدم مسجّل في تطبيق PADEL', 'Registered users on the PADEL app') },
      { value: 1100, suffix: '+', label: bi('قاعدة عملاء في الصالات الرياضية', 'Gym customer base') },
      { value: 800, label: bi('مشترك في جيم النخيل', 'Members at Nakheel gym') },
      { value: 300, label: bi('مشترك في جيم حي الإعلام', 'Members at Hay Al-I‘lam gym') },
      { value: 500, suffix: '+', label: bi('مستخدم نشط', 'Active users') },
      { value: 4, label: bi('فروع PADEL IQ في العراق', 'PADEL IQ branches in Iraq') },
    ],
    rushHours: { label: bi('ساعات الذروة', 'Peak hours'), value: '4 AM — 4 PM' },
    whyEyebrow: bi('لماذا مجموعة العراق الرياضية؟', 'Why IQ Sports Group?'),
    reasons: [
      { title: bi('فريق متخصص', 'A specialist team'), body: bi('في التسويق، وإدارة الفعاليات، وتشغيل الأكاديميات الرياضية.', 'Across marketing, event management and sports-academy operations.') },
      { title: bi('خبرة تشغيلية ناجحة', 'Proven operations'), body: bi('سجل ناجح في إدارة المجمعات الرياضية داخل العراق.', 'A successful record running sports complexes inside Iraq.') },
      { title: bi('أكثر من ٧٬٠٠٠ مستخدم', 'Over 7,000 users'), body: bi('على تطبيق PADEL، وأكثر من ٥٠٠ مستخدم نشط.', 'On the PADEL app, with more than 500 of them active.') },
      { title: bi('قاعدة عملاء واسعة', 'A broad customer base'), body: bi('أكثر من ١٬١٠٠ عميل في الصالات الرياضية.', 'More than 1,100 customers across the gyms.') },
      { title: bi('نظام حجز إلكتروني متطور', 'Advanced digital booking'), body: bi('حجز فوري للملاعب والحصص عبر التطبيق.', 'Instant court and class booking through the app.') },
    ],
    closing: { title: bi('منظومة واحدة متكاملة', 'One integrated system'), body: bi('ستّ رياضات، أربعة فروع، وفريق تشغيل واحد.', 'Six sports, four branches, one operating team.') },
    meta: { title: bi('الإحصائيات', 'Statistics'), description: bi('أكثر من ٧٬٠٠٠ مستخدم مسجّل، ١٬١٠٠ مشترك في الصالات، وأربعة فروع في بغداد — أرقام مجموعة العراق الرياضية.', 'Over 7,000 registered users, 1,100 gym members and four branches in Baghdad — IQ Sports Group in numbers.') },
  },
  team: {
    eyebrow: bi('الكادر التدريبي', 'Coaching staff'),
    title: bi('كوادر متخصصة', 'Specialist staff'),
    intro: bi('مدربون محترفون في البادل واللياقة والملاكمة، يشرفون على الأكاديميات والبرامج التدريبية.', 'Professional coaches in padel, fitness and boxing who run the academies and training programmes.'),
    summary: [
      { label: bi('الفرع', 'Branch'), value: bi('فرع النخيل', 'Nakheel branch') },
      { label: bi('قسم التسويق', 'Marketing department'), value: bi('٦ موظفين', '6 staff') },
      { label: bi('فريق التدريب', 'Coaching team'), value: bi('٤ مدربين محترفين', '4 professional coaches') },
    ],
    meta: { title: bi('الكادر التدريبي', 'Coaching staff'), description: bi('تعرّف على مدربي مجموعة العراق الرياضية في البادل وكمال الأجسام والملاكمة.', 'Meet IQ Sports Group’s padel, bodybuilding and boxing coaches.') },
  },
  tournaments: {
    eyebrow: bi('البطولات والدورات التدريبية', 'Tournaments & courses'),
    title: bi('ما أقمناه وما هو قادم', 'What we have hosted, and what is next'),
    intro: bi('البطولات التي نظّمتها المجموعة والدورات التدريبية المفتوحة للتسجيل.', 'Tournaments the group has organised and training courses open for registration.'),
    emptyMessage: bi('سيتم نشر البطولات والدورات قريباً — تابعنا على إنستغرام للحصول على آخر الأخبار.', 'Tournaments and courses will be published soon — follow us on Instagram for the latest news.'),
    meta: { title: bi('البطولات والدورات التدريبية', 'Tournaments & training courses'), description: bi('بطولات البادل والتنس وكرة القدم والدورات التدريبية في مجموعة العراق الرياضية.', 'Padel, tennis and football tournaments plus training courses at IQ Sports Group.') },
  },
  vision: {
    eyebrow: bi('الرؤية', 'Vision'),
    title: bi('المجموعة الرياضية الأولى في العراق', 'Iraq’s leading sports group'),
    intro: bi('', ''),
    statement: bi(
      'أن تصبح المجموعة الرياضية الأولى في العراق، من خلال تقديم تجربة متكاملة تجمع بين الرياضة، الصحة، الترفيه، والأكاديميات الاحترافية، وفق أعلى معايير الجودة.',
      'To become the leading sports group in Iraq by delivering one integrated experience across sport, health, leisure and professional academies — held to the highest standards of quality.',
    ),
    image: 'aerial-complex',
    mission: bi('', ''),
    values: [
      { title: bi('الحركة', 'Movement'), body: bi('الرياضة أسلوب حياة يومي لا مناسبة عابرة.', 'Sport as a daily way of life, not an occasional event.') },
      { title: bi('المجتمع', 'Community'), body: bi('ملاعب تجمع الناس وتبني علاقات تدوم.', 'Courts that bring people together and build lasting relationships.') },
      { title: bi('الأداء', 'Performance'), body: bi('منشآت ومدربون يرفعون مستوى كل لاعب.', 'Facilities and coaches that raise every player’s level.') },
      { title: bi('الطاقة', 'Energy'), body: bi('هوية معاصرة نابضة في كل فرع.', 'A contemporary, energetic identity in every branch.') },
    ],
    meta: { title: bi('الرؤية', 'Vision'), description: bi('رؤية مجموعة العراق الرياضية: المجموعة الرياضية الأولى في العراق بتجربة متكاملة تجمع الرياضة والصحة والترفيه والأكاديميات الاحترافية.', 'IQ Sports Group’s vision: Iraq’s leading sports group, with one integrated experience across sport, health, leisure and professional academies.') },
  },
}

/* ---------------------------------------------------- example events */

/**
 * Two example entries that show editors how a tournament and a course are
 * structured. They are saved as DRAFTS and never appear on the public site.
 */
export const SAMPLE_TOURNAMENTS = [
  {
    slug: 'example-padel-open',
    kind: 'tournament',
    title: bi('نموذج — بطولة بادل (عدّل هذا النموذج أو احذفه)', 'Example — Padel tournament (edit or delete this example)'),
    summary: bi('هذا نموذج توضيحي لصيغة البطولة. استبدل النصوص والصور بالبطولة الحقيقية ثم اضغط «نشر».', 'This is an example showing the tournament format. Replace the text and images with a real tournament, then click "Publish".'),
    cover: 'padel-courts',
    startDate: '2026-01-15',
    division: 'padel',
    branch: 'nakheel',
    highlights: [
      { label: bi('الفئة', 'Category'), value: bi('رجال — مفتوح', 'Men — open') },
      { label: bi('عدد الفرق', 'Teams'), value: bi('١٦ فريقاً', '16 teams') },
    ],
  },
  {
    slug: 'example-swim-course',
    kind: 'course',
    title: bi('نموذج — دورة تعليم السباحة للأطفال (عدّل أو احذف)', 'Example — Kids swimming course (edit or delete)'),
    summary: bi('نموذج توضيحي لصيغة الدورة التدريبية: المدة، المستوى، والمدرب. استبدله بالدورة الحقيقية ثم انشره.', 'An example of a training course entry: duration, level and coach. Replace it with a real course, then publish.'),
    cover: 'pool',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    division: 'swimming',
    branch: 'nakheel',
    highlights: [
      { label: bi('المدة', 'Duration'), value: bi('٤ أسابيع', '4 weeks') },
      { label: bi('المستوى', 'Level'), value: bi('مبتدئ', 'Beginner') },
    ],
  },
]
