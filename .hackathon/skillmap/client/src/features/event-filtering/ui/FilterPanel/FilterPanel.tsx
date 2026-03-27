import { useEffect, useState } from 'react';
import { Button, Input } from '@/shared/ui';
import { getCategories } from '@/entities/category';
import type { Category, AgeGroup } from '@/shared/types';
import type { FilterState } from '../../model';
import { initialFilters } from '../../model';
import styles from './FilterPanel.module.css';

const AGE_GROUPS: AgeGroup[] = [
  { id: 1, name: '6-7' },
  { id: 2, name: '7-9' },
  { id: 3, name: '8-9' },
  { id: 4, name: '9-11' },
  { id: 5, name: '10-11' },
];

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export const FilterPanel = ({ filters, onChange }: FilterPanelProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const toggleCategory = (id: number) => {
    const next = filters.categories.includes(id)
      ? filters.categories.filter((c) => c !== id)
      : [...filters.categories, id];
    onChange({ ...filters, categories: next, page: 1 });
  };

  const toggleAgeGroup = (id: number) => {
    const next = filters.ageGroups.includes(id)
      ? filters.ageGroups.filter((a) => a !== id)
      : [...filters.ageGroups, id];
    onChange({ ...filters, ageGroups: next, page: 1 });
  };

  const resetFilters = () => onChange(initialFilters);

  const activeCount =
    filters.categories.length +
    filters.ageGroups.length +
    (filters.format ? 1 : 0) +
    (filters.eventType ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <>
      <button
        className={styles.toggleBtn}
        onClick={() => setIsOpen((v) => !v)}
        type="button"
      >
        {isOpen ? 'Скрыть фильтры' : `Фильтры${activeCount > 0 ? ` (${activeCount})` : ''}`}
      </button>
      <aside className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Формат</h3>
          <div className={styles.radioGroup}>
            {[
              { value: '', label: 'Все' },
              { value: 'ONLINE', label: 'Онлайн' },
              { value: 'OFFLINE', label: 'Очно' },
            ].map((opt) => (
              <label key={opt.value} className={styles.radio}>
                <input
                  type="radio"
                  name="format"
                  checked={filters.format === opt.value}
                  onChange={() => onChange({ ...filters, format: opt.value, page: 1 })}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Тип мероприятия</h3>
          <div className={styles.radioGroup}>
            {[
              { value: '', label: 'Все' },
              { value: 'WEBINAR', label: 'Вебинар' },
              { value: 'COURSE', label: 'Курс' },
              { value: 'PROFPROBA', label: 'Профпроба' },
              { value: 'DOD', label: 'ДОД' },
            ].map((opt) => (
              <label key={opt.value} className={styles.radio}>
                <input
                  type="radio"
                  name="eventType"
                  checked={filters.eventType === opt.value}
                  onChange={() => onChange({ ...filters, eventType: opt.value, page: 1 })}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Направления</h3>
          <div className={styles.checkboxGroup}>
            {categories.map((cat) => (
              <label key={cat.id} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Возраст</h3>
          <div className={styles.checkboxGroup}>
            {AGE_GROUPS.map((ag) => (
              <label key={ag.id} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={filters.ageGroups.includes(ag.id)}
                  onChange={() => toggleAgeGroup(ag.id)}
                />
                <span>{ag.name} кл.</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Даты</h3>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value, page: 1 })}
            label="От"
          />
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value, page: 1 })}
            label="До"
          />
        </div>

        <Button variant="secondary" onClick={resetFilters} size="sm">
          Сбросить фильтры
        </Button>
      </aside>
    </>
  );
};
