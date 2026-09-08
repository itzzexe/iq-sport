'use client'

import { useLang } from '@/lib/lang'
import { useCountUp } from '@/lib/hooks'
import { RUSH_HOURS, STATS, WHY, type Stat } from '@/data/site'
import { Eyebrow, LogoMark, Reveal } from './primitives'

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const { t, lang } = useLang()
  const { ref, value } = useCountUp(stat.value, 1500 + index * 120)

  return (
    <div
      className="js-fade group relative flex flex-col justify-between gap-6 border-t border-white/10 py-8"
      style={{ '--i': index } as React.CSSProperties}
    >
      <span className="u-mono text-[0.6rem] text-n-600">{String(index + 1).padStart(2, '0')}</span>

      <div>
        {/* The outer span keeps the page direction so the figure stays aligned
            with the card; the inner one is isolated as LTR because numbers run
            left-to-right in Arabic too. Without the isolation, bidi reordering
            throws the "+" to the wrong side — "٧٬٠٠٠+" renders as "+٧٬٠٠٠". */}
        <span
          ref={ref}
          className="u-display block text-[clamp(2.75rem,7vw,5.5rem)] leading-none text-green tabular-nums"
        >
          <bdi dir="ltr">
            {value.toLocaleString(lang === 'ar' ? 'ar-IQ' : 'en-US')}
            {stat.suffix ?? ''}
          </bdi>
        </span>
        <p className="mt-3 max-w-[24ch] text-sm leading-relaxed text-n-400">{t(stat.label)}</p>
      </div>

      <span className="h-px w-full origin-left scale-x-0 bg-green transition-transform duration-700 group-hover:scale-x-100" />
    </div>
  )
}

export function Stats() {
  const { t, lang } = useLang()

  return (
    <section id="numbers" className="shell relative py-[clamp(5rem,14vh,10rem)]">
      <Reveal>
        <Eyebrow label={{ ar: 'الأرقام', en: 'By the numbers' }} index="04" />
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="u-display max-w-[16ch] text-[clamp(2.25rem,5.5vw,4.5rem)] text-paper">
            {lang === 'ar' ? 'قاعدة تنمو كل يوم' : 'A base that grows daily'}
          </h2>
          <div className="flex items-baseline gap-3">
            <span className="u-mono text-[0.6rem] text-n-500">{t(RUSH_HOURS.label)}</span>
            <span className="u-mono text-lg text-green">{RUSH_HOURS.value}</span>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((stat, i) => (
          <StatCard key={stat.label.en} stat={stat} index={i} />
        ))}
      </Reveal>

      {/* ------------------------------------------------------------- why */}
      <Reveal className="mt-[clamp(4rem,10vh,8rem)]">
        <Eyebrow label={{ ar: 'لماذا مجموعة العراق الرياضية؟', en: 'Why IQ Sports Group?' }} />

        <ul className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((item, i) => (
            <li
              key={item.n}
              className="js-fade group relative flex min-h-[13rem] flex-col justify-between gap-6 bg-ink p-6 transition-colors duration-500 hover:bg-n-900 sm:p-8"
              style={{ '--i': i } as React.CSSProperties}
            >
              <span className="u-mono text-[0.65rem] text-green">{item.n}</span>
              <div>
                <h3 className="u-display text-xl text-paper sm:text-2xl">{t(item.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-n-400">{t(item.body)}</p>
              </div>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-green transition-transform duration-500 group-hover:scale-x-100" />
            </li>
          ))}

          {/* Five reasons in a three-column grid leaves a hole in the last row.
              Rather than an empty cell showing the divider colour, the sixth
              slot closes the argument and points at the booking CTA. */}
          <li className="js-fade flex min-h-[13rem] flex-col justify-between gap-6 bg-green p-6 text-ink sm:p-8">
            <LogoMark className="w-10 text-ink" />
            <div>
              <h3 className="u-display text-xl sm:text-2xl">
                {lang === 'ar' ? 'منظومة واحدة متكاملة' : 'One integrated system'}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                {lang === 'ar'
                  ? 'ستّ رياضات، أربعة فروع، وفريق تشغيل واحد.'
                  : 'Six sports, four branches, one operating team.'}
              </p>
            </div>
          </li>
        </ul>
      </Reveal>
    </section>
  )
}
