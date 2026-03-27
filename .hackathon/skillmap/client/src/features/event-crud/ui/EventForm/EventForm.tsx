import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select } from '@/shared/ui';
import { useToast } from '@/shared/ui';
import { getCategories } from '@/entities/category';
import type { Category, Event } from '@/shared/types';
import { createEvent, updateEvent } from '../../api';
import styles from './EventForm.module.css';

const AGE_GROUPS = [
  { id: 1, name: '6-7' },
  { id: 2, name: '7-9' },
  { id: 3, name: '8-9' },
  { id: 4, name: '9-11' },
  { id: 5, name: '10-11' },
  { id: 6, name: 'педагоги' },
  { id: 7, name: 'родители' },
];

const schema = z.object({
  title: z.string().min(3, 'Минимум 3 символа'),
  description: z.string().min(10, 'Минимум 10 символов'),
  date: z.string().min(1, 'Выберите дату'),
  endDate: z.string().optional(),
  time: z.string().optional(),
  format: z.enum(['ONLINE', 'OFFLINE']),
  eventType: z.enum(['WEBINAR', 'COURSE', 'PROFPROBA', 'DOD']),
  registrationLink: z.string().optional(),
  organizerEmail: z.string().email('Некорректный email'),
});

type FormData = z.infer<typeof schema>;

interface EventFormProps {
  event?: Event;
  onSuccess: () => void;
}

export const EventForm = ({ event, onSuccess }: EventFormProps) => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    event?.categories.map((c) => c.id) || []
  );
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<number[]>(
    event?.ageGroups.map((a) => a.id) || []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          date: event.date.split('T')[0],
          endDate: event.endDate?.split('T')[0] || '',
          time: event.time || '',
          format: event.format,
          eventType: event.eventType,
          registrationLink: event.registrationLink || '',
          organizerEmail: event.organizerEmail,
        }
      : { format: 'ONLINE', eventType: 'WEBINAR' },
  });

  const onSubmit = async (data: FormData) => {
    if (selectedCategories.length === 0) {
      showToast('Выберите хотя бы одну категорию', 'error');
      return;
    }
    if (selectedAgeGroups.length === 0) {
      showToast('Выберите хотя бы одну возрастную группу', 'error');
      return;
    }

    try {
      setLoading(true);
      const body = {
        ...data,
        endDate: data.endDate || null,
        time: data.time || null,
        registrationLink: data.registrationLink || null,
        categoryIds: selectedCategories,
        ageGroupIds: selectedAgeGroups,
      };

      if (event) {
        await updateEvent(event.id, body);
        showToast('Событие обновлено', 'success');
      } else {
        await createEvent(body);
        showToast('Событие создано', 'success');
      }
      onSuccess();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Ошибка', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Input label="Название" {...register('title')} error={errors.title?.message} />
      <div className={styles.field}>
        <label className={styles.label}>Описание</label>
        <textarea className={styles.textarea} {...register('description')} rows={4} />
        {errors.description && <span className={styles.error}>{errors.description.message}</span>}
      </div>
      <div className={styles.row}>
        <Input label="Дата начала" type="date" {...register('date')} error={errors.date?.message} />
        <Input label="Дата окончания" type="date" {...register('endDate')} />
        <Input label="Время" type="time" {...register('time')} />
      </div>
      <div className={styles.row}>
        <Select
          label="Формат"
          {...register('format')}
          options={[
            { value: 'ONLINE', label: 'Онлайн' },
            { value: 'OFFLINE', label: 'Очно' },
          ]}
        />
        <Select
          label="Тип"
          {...register('eventType')}
          options={[
            { value: 'WEBINAR', label: 'Вебинар' },
            { value: 'COURSE', label: 'Курс' },
            { value: 'PROFPROBA', label: 'Профпроба' },
            { value: 'DOD', label: 'ДОД' },
          ]}
        />
      </div>
      <Input label="Email организатора" type="email" {...register('organizerEmail')} error={errors.organizerEmail?.message} />
      <Input label="Ссылка на регистрацию" {...register('registrationLink')} />
      <div className={styles.field}>
        <label className={styles.label}>Категории</label>
        <div className={styles.checkboxGroup}>
          {categories.map((cat) => (
            <label key={cat.id} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() =>
                  setSelectedCategories((prev) =>
                    prev.includes(cat.id) ? prev.filter((c) => c !== cat.id) : [...prev, cat.id]
                  )
                }
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Возрастные группы</label>
        <div className={styles.checkboxGroup}>
          {AGE_GROUPS.map((ag) => (
            <label key={ag.id} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={selectedAgeGroups.includes(ag.id)}
                onChange={() =>
                  setSelectedAgeGroups((prev) =>
                    prev.includes(ag.id) ? prev.filter((a) => a !== ag.id) : [...prev, ag.id]
                  )
                }
              />
              <span>{ag.name}</span>
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" loading={loading} size="lg">
        {event ? 'Сохранить' : 'Создать событие'}
      </Button>
    </form>
  );
};
