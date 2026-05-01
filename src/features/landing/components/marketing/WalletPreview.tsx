import { Check, Plus, Wallet as WalletIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';

export function WalletPreview() {
  const { t } = useTranslation();
  const bullets = t('landing.wallet.bullets', { returnObjects: true }) as string[];
  return (
    <Section>
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
              {t('landing.wallet.eyebrow')}
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
              {t('landing.wallet.title')}
            </h2>
            <p className="mt-4 max-w-xl text-base text-text-secondary leading-relaxed">
              {t('landing.wallet.body')}
            </p>
            <ul className="mt-6 space-y-3">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500/15 text-accent-700 dark:text-accent-300">
                    <Check size={12} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20 blur-2xl" />
            <div className="rounded-3xl border border-border bg-surface-elevated p-5 shadow-soft-lg">
              <div className="rounded-2xl bg-[linear-gradient(135deg,#1e3a8a,#10b981)] p-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WalletIcon size={18} />
                    <span className="text-sm font-medium">{t('landing.wallet.mockTitle')}</span>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur"
                  >
                    <Plus size={12} /> {t('landing.wallet.mockTopUp')}
                  </button>
                </div>
                <p className="mt-6 text-xs text-white/70">{t('landing.wallet.mockBalance')}</p>
                <p className="text-3xl font-bold tracking-tight">85,000 IQD</p>
              </div>
              <ul className="mt-4 space-y-2">
                <Tx>{t('landing.wallet.mockTxn1')}</Tx>
                <Tx>{t('landing.wallet.mockTxn2')}</Tx>
                <Tx>{t('landing.wallet.mockTxn3')}</Tx>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function Tx({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
      <span className="text-text-secondary">{children}</span>
      <span className="text-xs text-text-muted">today</span>
    </li>
  );
}
