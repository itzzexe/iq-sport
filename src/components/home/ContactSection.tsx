import type { Branch, Division, Home, Setting } from '@/payload-types'
import type { Locale } from '@/lib/i18n'
import { makeT } from '@/lib/labels'
import { Reveal } from '../ui/Reveal'
import { Eyebrow } from '../ui/bits'
import { BOOKING_LABEL_KEYS, type BookingLabelKey } from '@/lib/booking-labels'
import { BookingForm } from './BookingForm'

export function ContactSection({
  contact,
  settings,
  locale,
  branches,
  divisions,
}: {
  contact: Home['contact']
  settings: Setting
  locale: Locale
  branches: Branch[]
  divisions: Division[]
}) {
  const t = makeT(settings, locale)
  const labels = Object.fromEntries(BOOKING_LABEL_KEYS.map((k) => [k, t(k)])) as Record<BookingLabelKey, string>
  const phoneHref = settings.phone ? `tel:${settings.phone.replace(/[^\d+]/g, '')}` : null
  const whatsappHref = settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}` : null

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden border-t u-hairline bg-n-950">
      <div className="shell py-[clamp(5rem,14vh,10rem)]">
        <Reveal>
          <Eyebrow>{contact.eyebrow}</Eyebrow>
          <h2 className="js-reveal mt-5 max-w-[14ch] text-[clamp(2.6rem,7vw,6rem)] text-paper">{contact.title}</h2>
          {contact.body && <p className="js-reveal mt-6 max-w-[50ch] text-base leading-[1.8] text-n-300 sm:text-lg">{contact.body}</p>}

          <div className="mt-12 grid gap-x-16 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <BookingForm
                locale={locale}
                branches={branches.map((b) => ({ id: b.id, label: b.title, slug: b.slug }))}
                divisions={divisions.filter((d) => d.bookable !== false).map((d) => ({ id: d.id, label: d.title, slug: d.slug }))}
                labels={labels}
                intro={contact.formIntro}
                success={contact.successMessage}
                whatsapp={settings.whatsapp}
                siteName={settings.siteName}
              />
            </div>

            <aside className="flex flex-col gap-8 lg:col-span-5" aria-label={t('phone')}>
              <dl className="flex flex-col divide-y divide-white/10 border-y border-white/10">
                {settings.phone && (
                  <div className="flex flex-col gap-1 py-5">
                    <dt className="text-sm text-n-500">{t('phone')}</dt>
                    <dd>
                      <a href={phoneHref ?? undefined} dir="ltr" className="inline-block text-2xl text-paper transition-colors hover:text-green sm:text-3xl">
                        {settings.phone}
                      </a>
                    </dd>
                  </div>
                )}
                {whatsappHref && (
                  <div className="flex flex-col gap-1 py-5">
                    <dt className="text-sm text-n-500">{t('whatsapp')}</dt>
                    <dd>
                      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" dir="ltr" className="inline-block text-lg text-paper transition-colors hover:text-green">
                        +{settings.whatsapp?.replace(/\D/g, '')}
                      </a>
                    </dd>
                  </div>
                )}
                {settings.email && (
                  <div className="flex flex-col gap-1 py-5">
                    <dt className="text-sm text-n-500">{t('email')}</dt>
                    <dd>
                      <a href={`mailto:${settings.email}`} dir="ltr" className="inline-block text-lg text-paper transition-colors hover:text-green">
                        {settings.email}
                      </a>
                    </dd>
                  </div>
                )}
                {settings.address && (
                  <div className="flex flex-col gap-1 py-5">
                    <dt className="text-sm text-n-500">{t('address')}</dt>
                    <dd className="text-base text-paper">
                      {settings.address}
                      {settings.mapsUrl && (
                        <>
                          {' — '}
                          <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-green underline-offset-4 hover:underline">
                            {t('viewOnMap')}
                          </a>
                        </>
                      )}
                    </dd>
                  </div>
                )}
                {settings.hours && (
                  <div className="flex flex-col gap-1 py-5">
                    <dt className="text-sm text-n-500">{t('hours')}</dt>
                    <dd className="text-base text-paper">{settings.hours}</dd>
                  </div>
                )}
              </dl>
              {contact.note && <p className="max-w-[40ch] text-sm leading-relaxed text-n-500">{contact.note}</p>}
            </aside>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
