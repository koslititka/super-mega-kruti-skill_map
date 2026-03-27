import styles from './Badge.module.css';

const BADGE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  'Вебинар':    { bg: '#edfce8', color: '#1d8a0e', border: '#c8f0bf' },
  'МК':         { bg: '#F0F8FF', color: '#1A6AAA', border: '#BDD9F5' },
  'Мастер-класс': { bg: '#F0F8FF', color: '#1A6AAA', border: '#BDD9F5' },
  'ДОД':        { bg: '#FFF8EC', color: '#A06010', border: '#F0D898' },
  'Курс':       { bg: '#F5F0FF', color: '#6030AA', border: '#D8C8F8' },
  'Профпроба':  { bg: '#FFF0F0', color: '#AA2020', border: '#F5C0C0' },
};

const FALLBACK = { bg: '#F2F2F2', color: '#777777', border: '#E4E4E4' };

interface BadgeProps {
  label: string;
}

export function Badge({ label }: BadgeProps) {
  const { bg, color, border } = BADGE_COLORS[label] ?? FALLBACK;
  return (
    <span
      className={styles.badge}
      style={{ backgroundColor: bg, color, border: `0.5px solid ${border}` }}
    >
      {label}
    </span>
  );
}
