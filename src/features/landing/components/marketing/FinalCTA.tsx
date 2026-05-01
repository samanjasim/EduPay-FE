import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { LandingButton } from '../ui/Button';

const ACCOUNTS = [
  { roleKey: 'superadmin', email: 'superadmin@edupay.com', password: 'Admin@123456' },
  { roleKey: 'schooladmin', email: 'ahmed.admin@edupay.com', password: 'Admin@123456' },
  { roleKey: 'parent', email: 'parent@edupay.com', password: 'Parent@123456' },
  { roleKey: 'student', email: 'student@edupay.com', password: 'Student@123456' },
] as const;

export function FinalCTA() {
  const { t } = useTranslation();
  return (
    <Section>
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#065f46_100%)] p-8 sm:p-12 text-white">
          <div className="absolute -top-24 -end-24 h-72 w-72 rounded-full bg-primary-500/40 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 -start-24 h-72 w-72 rounded-full bg-accent-500/40 blur-3xl" aria-hidden />

          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                {t('landing.finalCta.eyebrow')}
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
                {t('landing.finalCta.title')}
              </h2>
              <p className="mt-4 max-w-xl text-base text-white/80 leading-relaxed">
                {t('landing.finalCta.body')}
              </p>
              <div className="mt-7">
                <LandingButton
                  as="link"
                  to={ROUTES.LOGIN}
                  variant="gradient"
                  size="lg"
                  rightIcon={<ArrowRight size={18} className="rtl:rotate-180" />}
                >
                  {t('landing.finalCta.open')}
                </LandingButton>
              </div>
            </div>

            <ul className="grid gap-3">
              {ACCOUNTS.map((a) => (
                <li
                  key={a.email}
                  className="flex flex-col gap-1 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    {t(`landing.finalCta.${a.roleKey}`)}
                  </p>
                  <span className="text-sm font-medium text-white">{a.email}</span>
                  <p className="font-mono text-xs text-white/70">{a.password}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
