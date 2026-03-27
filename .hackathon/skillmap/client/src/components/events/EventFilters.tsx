import { Pill } from '../ui/Pill';
import styles from './EventFilters.module.css';

export type ViewMode = 'grid' | 'list' | 'calendar';

export interface EventFiltersState {
  direction: string | null;
  format: string | null;
  ageGroup: string | null;
  category: string | null;
  view: ViewMode;
  /** Set externally by EventCalendar to filter by specific date (YYYY-MM-DD) */
  date: string | null;
}

export const INITIAL_FILTERS: EventFiltersState = {
  direction: null,
  format: null,
  ageGroup: null,
  category: null,
  view: 'grid',
  date: null,
};

interface EventFiltersProps {
  filters: EventFiltersState;
  onChange: (f: EventFiltersState) => void;
}

const GROUPS = [
  {
    key: 'direction' as const,
    label: 'Направление',
    options: ['Python', 'C++', 'GameDev', 'Data Science', '3D', 'Веб', 'ОГЭ/ЕГЭ'],
  },
  {
    key: 'format' as const,
    label: 'Формат',
    options: ['Онлайн', 'Очно'],
  },
  {
    key: 'ageGroup' as const,
    label: 'Возраст',
    options: ['6-7 кл', '8-9 кл', '10-11 кл'],
  },
  {
    key: 'category' as const,
    label: 'Категория',
    options: ['Вебинар', 'Курс', 'МК', 'ДОД', 'Профпроба'],
  },
];

// SVG icons
const IconGrid = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" />
    <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" />
    <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" />
    <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" />
  </svg>
);

const IconList = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="1" y="2" width="12" height="2" rx="1" fill="currentColor" />
    <rect x="1" y="6" width="12" height="2" rx="1" fill="currentColor" />
    <rect x="1" y="10" width="12" height="2" rx="1" fill="currentColor" />
  </svg>
);

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="1" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <line x1="1" y1="6.5" x2="13" y2="6.5" stroke="currentColor" strokeWidth="1.2" />
    <line x1="4.5" y1="1" x2="4.5" y2="4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="9.5" y1="1" x2="9.5" y2="4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const VIEW_OPTIONS: { key: ViewMode; Icon: () => JSX.Element; label: string }[] = [
  { key: 'grid', Icon: IconGrid, label: 'Сетка' },
  { key: 'list', Icon: IconList, label: 'Список' },
  { key: 'calendar', Icon: IconCalendar, label: 'Календарь' },
];

export function EventFilters({ filters, onChange }: EventFiltersProps) {
  const toggle = (key: keyof Omit<EventFiltersState, 'view'>, value: string) => {
    onChange({ ...filters, [key]: filters[key] === value ? null : value });
  };

  const setView = (view: ViewMode) => onChange({ ...filters, view });

  return (
    <div className={styles.bar} role="search" aria-label="Фильтры событий">
      <div className={styles.inner}>
        {GROUPS.map((group) => (
          <div key={group.key} className={styles.group}>
            <span className={styles.label}>{group.label}</span>
            <div className={styles.pills}>
              {group.options.map((opt) => (
                <Pill
                  key={opt}
                  label={opt}
                  active={filters[group.key] === opt}
                  onClick={() => toggle(group.key, opt)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* View toggle */}
        <div className={styles.viewToggle} role="group" aria-label="Вид отображения">
          {VIEW_OPTIONS.map(({ key, Icon, label }) => (
            <button
              key={key}
              type="button"
              className={`${styles.viewBtn}${filters.view === key ? ` ${styles.viewBtnActive}` : ''}`}
              onClick={() => setView(key)}
              aria-label={label}
              aria-pressed={filters.view === key}
            >
              <Icon />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
