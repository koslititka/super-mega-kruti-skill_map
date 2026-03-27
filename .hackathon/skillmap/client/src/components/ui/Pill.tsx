import styles from './Pill.module.css';

interface PillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function Pill({ label, active = false, onClick }: PillProps) {
  return (
    <button
      type="button"
      className={`${styles.pill}${active ? ` ${styles.pillActive}` : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
