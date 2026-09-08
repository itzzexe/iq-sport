import { DIVISIONS, type Bi } from './site'

/**
 * Long-form content for the per-division pages (/divisions/<slug>).
 *
 * Facts and figures are only those stated in the company profile deck; where
 * the deck is silent (basketball, football detail) the copy stays descriptive
 * and makes no numeric claims.
 */
export type DivisionPage = {
  /** one-line positioning under the title */
  lede: Bi
  story: Bi[]
  features: { title: Bi; body: Bi }[]
  /** branch slugs where this division is available, per the profile deck */
  branches: string[]
  /** a single headline figure, only when the deck supports one */
  figure?: { value: number; suffix?: string; label: Bi }
  /** coaches for this division, from the team page of the deck */
  coaches?: string[]
}

export const DIVISION_PAGES: Record<string, DivisionPage> = {
  padel: {
    lede: {
      ar: 'ثمانية ملاعب في ثلاثة فروع، وأكاديمية تبدأ من الأطفال وتصل إلى البطولات.',
      en: 'Eight courts across three branches, and an academy that runs from juniors to tournament play.',
    },
    story: [
      {
        ar: 'PADEL IQ هي العلامة التي انطلقت منها المجموعة، وهي اليوم أكبر شبكة ملاعب بادل في العراق: ثلاثة ملاعب في مجمع نخيل بغداد، ملعبان في زيونة، وثلاثة في شارع فلسطين.',
        en: 'PADEL IQ is the brand the group grew out of, and today it is the largest padel network in Iraq: three courts at Nakheel Baghdad Mall, two in Zayouna and three on Palestine Street.',
      },
      {
        ar: 'الملاعب مجهّزة وفق أحدث المواصفات العالمية، والأكاديمية تعمل بإشراف مدربين محترفين لفئتي الكبار والأطفال، مع تقويم منتظم من البطولات والفعاليات.',
        en: 'The courts are built to the latest international specifications, and the academy runs under professional coaches for both adults and children, with a regular calendar of tournaments and events.',
      },
      {
        ar: 'أكثر من سبعة آلاف مستخدم مسجّل في التطبيق يحجزون ملاعبهم خلال ثوانٍ، وأكثر من خمسمئة منهم يلعبون بانتظام.',
        en: 'More than seven thousand registered users book their courts through the app in seconds, and more than five hundred of them play regularly.',
      },
    ],
    features: [
      { title: { ar: 'مواصفات عالمية', en: 'International spec' }, body: { ar: 'أرضيات وزجاج وإضاءة وفق أحدث المعايير الدولية للعبة.', en: 'Turf, glass and lighting to the latest international standard for the game.' } },
      { title: { ar: 'أكاديمية للكبار والأطفال', en: 'Adult & junior academy' }, body: { ar: 'مسارات تدريب منفصلة بإشراف مدربين محترفين.', en: 'Separate coaching tracks under professional coaches.' } },
      { title: { ar: 'بطولات وفعاليات', en: 'Tournaments & events' }, body: { ar: 'استضافة بطولات وفعاليات رياضية على مدار الموسم.', en: 'Tournaments and sporting events hosted through the season.' } },
      { title: { ar: 'حجز فوري', en: 'Instant booking' }, body: { ar: 'نظام حجز إلكتروني متطور عبر تطبيق PADEL IQ.', en: 'An advanced booking system through the PADEL IQ app.' } },
    ],
    branches: ['nakheel', 'zayouna', 'palestine'],
    figure: { value: 7000, suffix: '+', label: { ar: 'مستخدم مسجّل في التطبيق', en: 'registered app users' } },
    coaches: ['ali'],
  },

  gym: {
    lede: {
      ar: 'صالتان، أكثر من ألف ومئة مشترك، ومدرّبون مختصون في القوة والملاكمة.',
      en: 'Two floors, over eleven hundred members, and specialist coaches in strength and boxing.',
    },
    story: [
      {
        ar: 'صالة رياضية متكاملة تضم أحدث الأجهزة الرياضية، مع برامج تدريبية متنوعة بإشراف مدربين مختصين.',
        en: 'A complete fitness floor with the latest equipment, running varied training programmes under specialist coaches.',
      },
      {
        ar: 'تعمل المجموعة اليوم بصالتين: ثمانمئة مشترك في جيم النخيل، وثلاثمئة في جيم حي الإعلام — قاعدة عملاء تتجاوز الألف ومئة وتنمو كل شهر.',
        en: 'The group runs two gyms today: eight hundred members at Nakheel and three hundred at Hay Al-I‘lam — a customer base past eleven hundred and growing every month.',
      },
      {
        ar: 'ساعات الذروة تمتد من الرابعة فجراً حتى الرابعة عصراً، والفريق التدريبي يضم مدرباً لكمال الأجسام وآخر للملاكمة.',
        en: 'Peak hours run from four in the morning to four in the afternoon, and the coaching team includes a bodybuilding coach and a boxing coach.',
      },
    ],
    features: [
      { title: { ar: 'أحدث الأجهزة', en: 'Latest equipment' }, body: { ar: 'مناطق للقوة والكارديو والتدريب الوظيفي.', en: 'Strength, cardio and functional zones.' } },
      { title: { ar: 'برامج متنوعة', en: 'Varied programmes' }, body: { ar: 'خطط تدريب تناسب المبتدئ والمحترف.', en: 'Plans that suit beginners and athletes alike.' } },
      { title: { ar: 'كمال أجسام', en: 'Bodybuilding' }, body: { ar: 'إشراف مباشر من مدرب مختص.', en: 'Direct supervision from a specialist coach.' } },
      { title: { ar: 'ملاكمة', en: 'Boxing' }, body: { ar: 'حصص تدريب بإشراف كابتن ملاكمة.', en: 'Sessions led by a boxing captain.' } },
    ],
    branches: ['nakheel', 'ilam'],
    figure: { value: 1100, suffix: '+', label: { ar: 'مشترك في الصالات الرياضية', en: 'gym members' } },
    coaches: ['yousif', 'ammar'],
  },

  swimming: {
    lede: {
      ar: 'مسبح حديث بأكاديمية سباحة، وأوقات مخصصة للرجال وأخرى للنساء.',
      en: 'A modern pool with a swimming academy, and dedicated men’s and women’s sessions.',
    },
    story: [
      {
        ar: 'مسبح حديث يضم أكاديمية سباحة للكبار والأطفال، بالإضافة إلى أوقات مخصصة للرجال وأخرى للنساء، لتوفير تجربة تناسب مختلف الفئات.',
        en: 'A modern pool with a swimming academy for adults and children, plus dedicated men’s and women’s sessions so the experience suits everyone.',
      },
      {
        ar: 'في فرع مجمع نخيل بغداد يُكمل المسبحَ جاكوزي وساونا، فيتحول القسم من مكان للتدريب إلى مكان للاستشفاء أيضاً.',
        en: 'At the Nakheel Baghdad Mall branch a jacuzzi and sauna complete the pool, turning the division from a place to train into a place to recover as well.',
      },
    ],
    features: [
      { title: { ar: 'أكاديمية سباحة', en: 'Swim academy' }, body: { ar: 'تعليم وتدريب للكبار والأطفال.', en: 'Lessons and training for adults and children.' } },
      { title: { ar: 'أوقات مخصصة', en: 'Dedicated sessions' }, body: { ar: 'جداول منفصلة للرجال والنساء.', en: 'Separate schedules for men and women.' } },
      { title: { ar: 'جاكوزي', en: 'Jacuzzi' }, body: { ar: 'للاسترخاء بعد التدريب.', en: 'To unwind after training.' } },
      { title: { ar: 'ساونا', en: 'Sauna' }, body: { ar: 'استشفاء عضلي في فرع النخيل.', en: 'Muscle recovery at the Nakheel branch.' } },
    ],
    branches: ['nakheel'],
  },

  tennis: {
    lede: {
      ar: 'ملاعب للهواة والمحترفين، تستضيف البطولات والدورات التدريبية.',
      en: 'Courts for amateurs and professionals, hosting tournaments and coaching clinics.',
    },
    story: [
      {
        ar: 'ملاعب مجهّزة لاستقبال اللاعبين الهواة والمحترفين، مع إمكانية إقامة البطولات والدورات التدريبية.',
        en: 'Courts equipped for amateurs and professionals alike, ready to host tournaments and coaching clinics.',
      },
      {
        ar: 'التنس هو الرياضة التي تختبر الدقة قبل القوة: خط واحد يفصل النقطة عن الخطأ، ولهذا صُمّمت الملاعب لتمنح اللاعب سطحاً ثابتاً وإضاءة متساوية في كل زاوية.',
        en: 'Tennis tests precision before power: a single line separates the point from the fault, which is why the courts are built to give the player a consistent surface and even light in every corner.',
      },
    ],
    features: [
      { title: { ar: 'هواة ومحترفون', en: 'Amateur & pro' }, body: { ar: 'مستويات لعب متعددة على الملعب نفسه.', en: 'Multiple levels of play on the same court.' } },
      { title: { ar: 'بطولات', en: 'Tournaments' }, body: { ar: 'استضافة بطولات محلية.', en: 'Hosting local tournaments.' } },
      { title: { ar: 'دورات تدريبية', en: 'Training courses' }, body: { ar: 'برامج قصيرة ومكثفة.', en: 'Short, intensive programmes.' } },
      { title: { ar: 'إضاءة ليلية', en: 'Floodlit' }, body: { ar: 'لعب مسائي بإضاءة متساوية.', en: 'Evening play under even light.' } },
    ],
    branches: [],
  },

  football: {
    lede: {
      ar: 'ملاعب بمواصفات احترافية للفرق والدوريات والتدريب اليومي.',
      en: 'Professional-grade pitches for teams, leagues and daily training.',
    },
    story: [
      {
        ar: 'ملاعب كرة قدم بمواصفات احترافية تستوعب الفرق والدوريات والتدريبات اليومية، ضمن منظومة تشغيل متكاملة تدير الحجز والجدولة والفعاليات.',
        en: 'Professional-grade football pitches for teams, leagues and daily training, inside one integrated operating system that handles booking, scheduling and events.',
      },
      {
        ar: 'لعبة العالم — الفريق والطاقة والمجتمع. الملاعب مصمّمة بعشب صناعي ومدرجات جانبية وإضاءة كاشفة تسمح باللعب حتى ساعات الليل.',
        en: 'The world’s game — teamwork, energy and community. The pitches are built with artificial turf, side seating and floodlights that keep play going into the night.',
      },
    ],
    features: [
      { title: { ar: 'دوريات وفرق', en: 'Leagues & teams' }, body: { ar: 'تنظيم دوريات وحجز جماعي.', en: 'League organisation and team bookings.' } },
      { title: { ar: 'تدريب يومي', en: 'Daily training' }, body: { ar: 'حصص ثابتة للفرق والأكاديميات.', en: 'Fixed slots for teams and academies.' } },
      { title: { ar: 'عشب صناعي', en: 'Artificial turf' }, body: { ar: 'سطح ثابت في كل الفصول.', en: 'A consistent surface all year.' } },
      { title: { ar: 'إضاءة كاشفة', en: 'Floodlights' }, body: { ar: 'لعب ليلي كامل.', en: 'Full night play.' } },
    ],
    branches: [],
  },

  basketball: {
    lede: {
      ar: 'اللعب الجماعي والسرعة وأداء الملعب — ضمن منظومة الرياضات الستّ.',
      en: 'Team play, speed and court performance — part of the six-sport system.',
    },
    story: [
      {
        ar: 'كرة السلة تُكمل منظومة الأيقونات الرياضية الستّ للمجموعة: رياضة جماعية سريعة الإيقاع، مهيّأة للتدريب والمباريات المجتمعية داخل المجمّع.',
        en: 'Basketball completes the group’s six-sport icon system: a fast, team-first game set up for training and community fixtures inside the complex.',
      },
      {
        ar: 'الملعب جزء من المجمّع نفسه الذي يضم المسار والملاعب والصالة، فيتنقّل اللاعب بين الرياضات دون أن يغادر المكان.',
        en: 'The court sits inside the same complex as the track, the courts and the gym, so a player can move between sports without leaving the grounds.',
      },
    ],
    features: [
      { title: { ar: 'مباريات مجتمعية', en: 'Community fixtures' }, body: { ar: 'لقاءات دورية مفتوحة.', en: 'Regular open fixtures.' } },
      { title: { ar: 'تدريب', en: 'Training' }, body: { ar: 'حصص للفرق والأفراد.', en: 'Sessions for teams and individuals.' } },
      { title: { ar: 'ضمن المجمّع', en: 'Inside the complex' }, body: { ar: 'إلى جانب باقي الأقسام.', en: 'Alongside the other divisions.' } },
      { title: { ar: 'حجز بالتطبيق', en: 'App booking' }, body: { ar: 'عبر نظام الحجز الموحّد.', en: 'Through the unified booking system.' } },
    ],
    branches: [],
  },
}

/** Ordered slugs, so pages can offer previous / next navigation. */
export const DIVISION_ORDER = DIVISIONS.map((d) => d.slug)
