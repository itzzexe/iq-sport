'use client'

import { useLang } from '@/lib/lang'
import { CONTACT, SITE } from '@/data/site'
import { BackgroundVideo, Eyebrow, LogoLockup, Reveal } from './primitives'
import { BookingForm } from './BookingForm'

export function Contact() {
  const { t, lang } = useLang()

  return (
    <section id="contact" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <BackgroundVideo name="padel" className="opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/80 to-ink" />
      </div>

      <div className="shell py-[clamp(5rem,14vh,10rem)]">
        <Reveal>
          <Eyebrow label={CONTACT.eyebrow} index="07" />

          <h2 className="u-display mt-6 max-w-[14ch] text-[clamp(2.75rem,9vw,7rem)] text-paper">
            {t(CONTACT.title)}
          </h2>

          <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-n-300">
            {t(CONTACT.body)}
          </p>

          <div className="mt-10 grid gap-x-16 gap-y-10 lg:grid-cols-2">
            <BookingForm />

            <div className="flex flex-col justify-end gap-6">
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
                className="group flex items-baseline gap-4 border-b border-white/10 pb-4"
                dir="ltr"
              >
                <span className="u-mono text-[0.6rem] text-n-500">
                  {lang === 'ar' ? 'هاتف' : 'Phone'}
                </span>
                <span className="u-display text-2xl text-paper transition-colors group-hover:text-green sm:text-3xl">
                  {CONTACT.phone}
                </span>
              </a>

              <p className="max-w-[38ch] text-sm leading-relaxed text-n-500">
                {lang === 'ar'
                  ? 'ساعات الذروة في الصالات من 4 صباحاً حتى 4 مساءً. الحجز عبر التطبيق متاح على مدار الساعة.'
                  : 'Peak gym hours run 4 AM to 4 PM. App booking is open around the clock.'}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-16 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="js-fade" style={{ '--i': 0 } as React.CSSProperties}>
            <h3 className="u-mono text-[0.6rem] text-n-500">
              {lang === 'ar' ? 'العنوان' : 'Address'}
            </h3>
            <p className="mt-2 text-sm text-paper">{t(CONTACT.address)}</p>
          </div>

          <div className="js-fade" style={{ '--i': 1 } as React.CSSProperties}>
            <h3 className="u-mono text-[0.6rem] text-n-500">
              {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </h3>
            <a
              href={`mailto:${CONTACT.email}`}
              className="mt-2 block text-sm text-paper transition-colors hover:text-green"
              dir="ltr"
            >
              {CONTACT.email}
            </a>
          </div>

          <div className="js-fade" style={{ '--i': 2 } as React.CSSProperties}>
            <h3 className="u-mono text-[0.6rem] text-n-500">
              {lang === 'ar' ? 'تابعنا' : 'Follow'}
            </h3>
            <ul className="mt-2 flex flex-col gap-1">
              {CONTACT.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-paper transition-colors hover:text-green"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="js-fade" style={{ '--i': 3 } as React.CSSProperties}>
            <h3 className="u-mono text-[0.6rem] text-n-500">
              {lang === 'ar' ? 'المجموعة' : 'Group'}
            </h3>
            <LogoLockup className="mt-3 h-6 w-auto text-paper" title={t(SITE.name)} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
