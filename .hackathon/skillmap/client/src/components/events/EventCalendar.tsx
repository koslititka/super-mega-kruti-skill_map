import { useState, useMemo } from 'react';
import { useLocale } from '../../context/LocaleContext';
import type { MockEvent } from '../../data/mockEvents';
import styles from './EventCalendar.module.css';

interface EventCalendarProps {
  events: MockEvent[];
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
}

/** Convert Date → YYYY-MM-DD string in local time */
function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Generate the 42-cell (6 rows × 7 cols) grid for a given year/month */
function buildCalendarGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Mon-first offset (0=Mon … 6=Sun)
  const offset = (firstDay.getDay() + 6) % 7;

  const cells: Date[] = [];

  // Days from previous month
  for (let i = offset - 1; i >= 0; i--) {
    cells.push(new Date(year, month, -i));
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push(new Date(year, month, d));
  }

  // Next month fill to multiple of 7
  let next = 1;
  while (cells.length % 7 !== 0) {
    cells.push(new Date(year, month + 1, next++));
  }

  return cells;
}

export function EventCalendar({ events, selectedDate, onDateSelect }: EventCalendarProps) {
  const { t } = useLocale();
  const today = toDateStr(new Date());

  const [isVisible, setIsVisible] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const cells = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  // Set of dates that have at least one event
  const eventDates = useMemo(
    () => new Set(events.map((e) => e.date.slice(0, 10))),
    [events]
  );

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const handleDayClick = (d: Date) => {
    const str = toDateStr(d);
    if (d.getMonth() !== viewMonth) return; // ignore other-month cells
    if (!eventDates.has(str)) return;       // only days with events
    onDateSelect(selectedDate === str ? null : str);
  };

  const monthLabel = `${t.calendar.months[viewMonth]} ${viewYear}`;

  return (
    <div className={styles.wrapper}>
      {/* Mobile toggle */}
      <div className={styles.toggleRow}>
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setIsVisible((v) => !v)}
        >
          <span className={styles.toggleIcon}>📅</span>
          {isVisible ? t.calendar.hide : t.calendar.show}
        </button>
        {selectedDate && (
          <button type="button" className={styles.clearBtn} onClick={() => onDateSelect(null)}>
            ✕ {t.calendar.clearDate}
          </button>
        )}
      </div>

      {/* Calendar card — hidden on mobile unless toggled */}
      <div className={`${styles.card}${!isVisible ? ` ${styles.cardHidden}` : ''}`}
        style={{ display: undefined }} // override on desktop via CSS
      >
        {/* Month header */}
        <div className={styles.header}>
          <button type="button" className={styles.navBtn} onClick={prevMonth} aria-label="Предыдущий месяц">
            ‹
          </button>
          <span className={styles.monthLabel}>{monthLabel}</span>
          <button type="button" className={styles.navBtn} onClick={nextMonth} aria-label="Следующий месяц">
            ›
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className={styles.grid}>
          {t.calendar.weekDays.map((wd) => (
            <div key={wd} className={styles.weekDay}>{wd}</div>
          ))}

          {/* Day cells */}
          {cells.map((d, i) => {
            const str = toDateStr(d);
            const isOther = d.getMonth() !== viewMonth;
            const isToday = str === today;
            const isSelected = str === selectedDate;
            const hasEvent = eventDates.has(str) && !isOther;

            return (
              <button
                key={i}
                type="button"
                className={[
                  styles.dayCell,
                  isOther ? styles.otherMonth : '',
                  isToday && !isSelected ? styles.today : '',
                  isSelected ? styles.selected : '',
                  hasEvent ? styles.hasEvent : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleDayClick(d)}
                aria-label={str}
                aria-pressed={isSelected}
                tabIndex={isOther || !hasEvent ? -1 : 0}
              >
                <span className={styles.dayNum}>{d.getDate()}</span>
                {hasEvent && <span className={styles.dot} aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {/* Clear selected date */}
        {selectedDate && (
          <div className={styles.clearRow}>
            <button type="button" className={styles.clearBtn} onClick={() => onDateSelect(null)}>
              ✕ {t.calendar.clearDate}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
