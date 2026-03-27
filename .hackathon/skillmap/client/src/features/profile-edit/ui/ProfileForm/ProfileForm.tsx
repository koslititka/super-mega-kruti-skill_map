import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Select } from '@/shared/ui';
import { useToast } from '@/shared/ui';
import { useAuth } from '@/features/auth';
import { getCategories } from '@/entities/category';
import { updateProfile } from '@/entities/user';
import type { Category } from '@/shared/types';
import styles from './ProfileForm.module.css';

export const ProfileForm = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>(
    user?.interests.map((i) => i.id) || []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      grade: user?.grade ? String(user.grade) : '',
      age: user?.age ? String(user.age) : '',
      telegramUsername: user?.telegramUsername || '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await updateProfile({
        fullName: data.fullName,
        grade: data.grade ? parseInt(data.grade) : null,
        age: data.age ? parseInt(data.age) : null,
        telegramUsername: data.telegramUsername || null,
        interests: selectedInterests,
      });
      await refreshUser();
      showToast('Профиль обновлён', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Ошибка', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Input label="Полное имя" {...register('fullName')} />
      <Select
        label="Класс"
        {...register('grade')}
        placeholder="Не указан"
        options={[6, 7, 8, 9, 10, 11].map((g) => ({ value: String(g), label: `${g} класс` }))}
      />
      <Input
        label="Возраст (лет)"
        type="number"
        {...register('age')}
        placeholder="Введите возраст"
      />
      <Input label="Telegram username" {...register('telegramUsername')} placeholder="@username" />
      <div className={styles.interests}>
        <label className={styles.label}>Интересы</label>
        <div className={styles.list}>
          {categories.map((cat) => (
            <label key={cat.id} className={styles.chip}>
              <input
                type="checkbox"
                checked={selectedInterests.includes(cat.id)}
                onChange={() =>
                  setSelectedInterests((prev) =>
                    prev.includes(cat.id) ? prev.filter((i) => i !== cat.id) : [...prev, cat.id]
                  )
                }
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" loading={loading}>
        Сохранить
      </Button>
    </form>
  );
};
