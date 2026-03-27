import { useLocale } from '../../context/LocaleContext';
import styles from './Hero.module.css';

/** Wraps the last word before an em-dash (—) in an accent span. */
function AccentedTitle({ text }: { text: string }) {
  const dashIndex = text.indexOf('—');
  if (dashIndex === -1) return <>{text}</>;

  const before = text.slice(0, dashIndex).trimEnd();
  const after = text.slice(dashIndex); // "— ..."
  const words = before.split(' ');
  const lastWord = words.pop();
  const rest = words.join(' ');

  return (
    <>
      {rest} <span className={styles.titleAccent}>{lastWord}</span> {after}
    </>
  );
}

interface StatCardProps {
  value: string;
  label: string;
  accent?: boolean;
}

function StatCard({ value, label, accent }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <span className={`${styles.statValue}${accent ? ` ${styles.statValueAccent}` : ''}`}>
        {value}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

export function Hero() {
  const { t } = useLocale();

  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        {/* Left column */}
        <div className={styles.heroLeft}>
          <p className={styles.eyebrow}>{t.hero.eyebrow}</p>
          <h1 className={styles.title}>
            <AccentedTitle text={t.hero.title} />
          </h1>
          <p className={styles.subtitle}>{t.hero.subtitle}</p>
          <div className={styles.ctas}>
            <a href="#events" className={styles.ctaPrimary}>
              {t.hero.cta}
            </a>
            <a href="#about" className={styles.ctaSecondary}>
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>

        {/* Right column — 2×2 stat grid */}
        <div className={styles.heroRight}>
          <StatCard value="48"  label={t.stats.eventsMonth}  accent />
          <StatCard value="#1"  label={t.stats.employment} />
          <StatCard value="12"  label={t.stats.directions} />
          <StatCard value="113" label={t.stats.experts} />
        </div>
      </div>
    </section>
  );
}
