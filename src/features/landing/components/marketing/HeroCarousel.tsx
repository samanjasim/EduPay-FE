import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Play, ShieldCheck, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { cn } from '@/utils';
import { LandingButton } from '../ui/Button';
import { Badge } from '@/components/ui';

type Slide = {
  src: string;
  srcSet: string;
  alt: string;
  badgeKey: 'classroom' | 'parents' | 'wallet' | 'admin' | 'graduation' | 'library';
  word: 'classrooms' | 'families' | 'fintech' | 'schools' | 'futures' | 'institutions';
};

const u = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

const SLIDES: Slide[] = [
  {
    src: u('photo-1503676260728-1c00da094a0b', 1920),
    srcSet: `${u('photo-1503676260728-1c00da094a0b', 960)} 960w, ${u('photo-1503676260728-1c00da094a0b', 1600)} 1600w, ${u('photo-1503676260728-1c00da094a0b', 1920)} 1920w`,
    alt: 'Students learning together in a bright classroom',
    badgeKey: 'classroom',
    word: 'classrooms',
  },
  {
    src: u('photo-1591115765373-5207764f72e7', 1920),
    srcSet: `${u('photo-1591115765373-5207764f72e7', 960)} 960w, ${u('photo-1591115765373-5207764f72e7', 1600)} 1600w, ${u('photo-1591115765373-5207764f72e7', 1920)} 1920w`,
    alt: 'Parent helping child with schoolwork on a phone',
    badgeKey: 'parents',
    word: 'families',
  },
  {
    src: u('photo-1556742049-0cfed4f6a45d', 1920),
    srcSet: `${u('photo-1556742049-0cfed4f6a45d', 960)} 960w, ${u('photo-1556742049-0cfed4f6a45d', 1600)} 1600w, ${u('photo-1556742049-0cfed4f6a45d', 1920)} 1920w`,
    alt: 'Mobile fintech payment with a card',
    badgeKey: 'wallet',
    word: 'fintech',
  },
  {
    src: u('photo-1497436072909-60f360e1d4b1', 1920),
    srcSet: `${u('photo-1497436072909-60f360e1d4b1', 960)} 960w, ${u('photo-1497436072909-60f360e1d4b1', 1600)} 1600w, ${u('photo-1497436072909-60f360e1d4b1', 1920)} 1920w`,
    alt: 'School administrator at a clean desk',
    badgeKey: 'admin',
    word: 'schools',
  },
  {
    src: u('photo-1523580494863-6f3031224c94', 1920),
    srcSet: `${u('photo-1523580494863-6f3031224c94', 960)} 960w, ${u('photo-1523580494863-6f3031224c94', 1600)} 1600w, ${u('photo-1523580494863-6f3031224c94', 1920)} 1920w`,
    alt: 'Graduates throwing caps in celebration',
    badgeKey: 'graduation',
    word: 'futures',
  },
  {
    src: u('photo-1481627834876-b7833e8f5570', 1920),
    srcSet: `${u('photo-1481627834876-b7833e8f5570', 960)} 960w, ${u('photo-1481627834876-b7833e8f5570', 1600)} 1600w, ${u('photo-1481627834876-b7833e8f5570', 1920)} 1920w`,
    alt: 'Library shelves filled with books',
    badgeKey: 'library',
    word: 'institutions',
  },
];

const AUTOPLAY_MS = 6000;

const TRUST_PILLS = [
  'Qi Card',
  'Aqsati BNPL',
  'ZainCash',
  'FIB',
  'Visa',
  'Mastercard',
  'Arabic · Kurdish · English',
  'IQD · Asia/Baghdad',
];

export function HeroCarousel() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length),
    []
  );
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let startX = 0;
    let dx = 0;
    const onStart = (e: TouchEvent) => {
      startX = e.touches[0]!.clientX;
      dx = 0;
    };
    const onMove = (e: TouchEvent) => {
      dx = e.touches[0]!.clientX - startX;
    };
    const onEnd = () => {
      if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('touchend', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
    };
  }, [next, prev]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  const active = SLIDES[index]!;

  return (
    <section
      className="relative isolate w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label={t('landing.hero.titleA')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div ref={trackRef} className="absolute inset-0 -z-10">
        {SLIDES.map((s, i) => {
          const isActive = i === index;
          return (
            <div
              key={s.src}
              className={cn(
                'absolute inset-0 transition-opacity duration-[1200ms] ease-out',
                isActive ? 'opacity-100' : 'opacity-0'
              )}
              aria-hidden={!isActive}
            >
              <img
                src={s.src}
                srcSet={s.srcSet}
                sizes="100vw"
                alt={s.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={i === 0 ? 'high' : 'low'}
                className={cn('h-full w-full object-cover', isActive && 'ken-burns-img')}
              />
            </div>
          );
        })}
        <div
          className="absolute inset-0 bg-[linear-gradient(115deg,rgba(2,6,23,0.78)_0%,rgba(2,6,23,0.55)_45%,rgba(2,6,23,0.35)_100%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.30),transparent_55%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:48px_48px]"
          aria-hidden="true"
        />
      </div>

      <div className="mx-auto flex min-h-[88vh] w-full max-w-7xl flex-col justify-center px-5 sm:px-6 lg:px-8 pt-24 pb-32 text-white">
        <div className="max-w-3xl">
          <div className="fade-up" style={{ animationDelay: '50ms' }}>
            <Badge variant="primary" className="border border-white/15 bg-white/10 px-3 py-1.5 text-white backdrop-blur">
              <Sparkles size={14} className="text-accent-300" />
              {t('landing.hero.badge')}
            </Badge>
          </div>

          <h1 className="mt-6 text-[clamp(2.4rem,6vw,5rem)] font-bold leading-[1.02] tracking-tight">
            <span className="fade-up block" style={{ animationDelay: '180ms' }}>
              {t('landing.hero.titleA')}
            </span>
            <span
              className="fade-up mt-1 block"
              style={{ animationDelay: '320ms', perspective: '800px' }}
            >
              <span className="text-white/85">{t('landing.hero.forWord')} </span>
              <span key={active.word} className="kinetic-word shimmer-text font-extrabold">
                {t(`landing.hero.words.${active.word}` as const)}
              </span>
              <span className="text-white/85">.</span>
            </span>
          </h1>

          <p
            className="fade-up mt-6 max-w-2xl text-base sm:text-lg lg:text-xl leading-relaxed text-white/80"
            style={{ animationDelay: '460ms' }}
          >
            {t('landing.hero.subtitle')}
          </p>

          <div className="fade-up mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: '600ms' }}>
            <LandingButton
              as="link"
              to={ROUTES.REGISTER}
              variant="gradient"
              size="lg"
              rightIcon={<ArrowRight size={18} className="rtl:rotate-180" />}
            >
              {t('landing.hero.ctaPrimary')}
            </LandingButton>
            <LandingButton
              as="a"
              href="#how"
              size="lg"
              leftIcon={<Play size={16} />}
              variant="secondary"
              className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            >
              {t('landing.hero.ctaSecondary')}
            </LandingButton>
          </div>

          <div className="fade-up mt-7 flex items-center gap-2 text-xs text-white/70" style={{ animationDelay: '740ms' }}>
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-accent-400 pulse-ring" />
              <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-accent-400" />
            </span>
            {t('landing.hero.trust')}
          </div>
        </div>
      </div>

      <FloatingCard activeIndex={index} />

      <button
        type="button"
        onClick={prev}
        aria-label={t('landing.showcase.prev')}
        className="absolute start-3 sm:start-5 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
      >
        <ChevronLeft size={22} className="rtl:rotate-180" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label={t('landing.showcase.next')}
        className="absolute end-3 sm:end-5 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
      >
        <ChevronRight size={22} className="rtl:rotate-180" />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="overflow-hidden border-t border-white/10 bg-black/30 backdrop-blur">
          <div className="marquee-track flex w-max items-center gap-10 py-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            {[...TRUST_PILLS, ...TRUST_PILLS].map((p, i) => (
              <span key={`${p}-${i}`} className="flex items-center gap-3">
                <ShieldCheck size={12} className="text-accent-300" />
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-t from-black/70 to-transparent">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-5 sm:px-6 lg:px-8 py-4">
            <span className="font-mono text-xs tabular-nums text-white/70">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-1 items-center gap-1.5">
              {SLIDES.map((s, i) => {
                const isActive = i === index;
                return (
                  <button
                    key={s.src}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`${t('landing.showcase.goTo')} ${i + 1}`}
                    aria-current={isActive}
                    className="group relative flex-1"
                  >
                    <span className="block h-[3px] w-full overflow-hidden rounded-full bg-white/15">
                      <span
                        className={cn(
                          'block h-full origin-[var(--origin,left)] rounded-full bg-white transition-transform',
                          isActive ? 'scale-x-100' : 'scale-x-0'
                        )}
                        style={{
                          ['--origin' as string]:
                            typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
                              ? 'right'
                              : 'left',
                          transitionDuration: isActive && !paused ? `${AUTOPLAY_MS}ms` : '300ms',
                          transitionTimingFunction: 'linear',
                        }}
                      />
                    </span>
                    <span
                      className={cn(
                        'mt-2 hidden text-[10px] font-medium uppercase tracking-[0.18em] sm:block',
                        isActive ? 'text-white' : 'text-white/45 group-hover:text-white/80'
                      )}
                    >
                      {t(`landing.showcase.badges.${s.badgeKey}`)}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="font-mono text-xs tabular-nums text-white/40">
              / {String(SLIDES.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ activeIndex }: { activeIndex: number }) {
  const { t } = useTranslation();
  return (
    <div
      className="pointer-events-none absolute end-6 top-28 z-10 hidden lg:block fade-in"
      style={{ animationDelay: '700ms' }}
      aria-hidden="true"
    >
      <div className="pointer-events-auto w-[300px] rounded-2xl border border-white/15 bg-white/10 p-5 text-white shadow-soft-lg backdrop-blur-xl">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/70">
          <span>{t('landing.hero.mockHeader')}</span>
          <span className="rounded-full bg-accent-500/20 px-2 py-0.5 font-semibold text-accent-200">
            {t('landing.hero.mockStatus')}
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight">1,250,000 IQD</p>
        <div className="mt-4 grid grid-cols-3 gap-1.5">
          {[100, 68, 0].map((v, i) => (
            <span key={i} className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <span
                className="block h-full rounded-full bg-[linear-gradient(90deg,#60a5fa,#34d399)]"
                style={{ width: `${v}%` }}
              />
            </span>
          ))}
        </div>
        <div className="mt-4 space-y-2 text-xs">
          <Row title="Tuition · Q2" tone="warn">
            {t('landing.hero.mockOverdue')}
          </Row>
          <Row title="Transport · Mar">{t('landing.hero.mockDue')}</Row>
          <Row title="Activities" tone="ok">
            {t('landing.hero.mockStatus')}
          </Row>
        </div>
        <div
          key={activeIndex}
          className="fade-in mt-4 rounded-xl bg-[linear-gradient(135deg,#2563eb_0%,#10b981_100%)] py-2.5 text-center text-xs font-semibold"
        >
          {t('landing.hero.mockPay')}
        </div>
      </div>
    </div>
  );
}

function Row({ title, children, tone }: { title: string; children: React.ReactNode; tone?: 'ok' | 'warn' }) {
  const cls =
    tone === 'ok'
      ? 'text-accent-200 bg-accent-500/15'
      : tone === 'warn'
        ? 'text-yellow-200 bg-yellow-500/15'
        : 'text-white/70 bg-white/10';
  return (
    <div className="flex items-center justify-between rounded-md border border-white/10 px-2.5 py-1.5">
      <span className="text-white/80">{title}</span>
      <span className={cn('rounded-full px-2 py-0.5 text-[10px]', cls)}>{children}</span>
    </div>
  );
}
