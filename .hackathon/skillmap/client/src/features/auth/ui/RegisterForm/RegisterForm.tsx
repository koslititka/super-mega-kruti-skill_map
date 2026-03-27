import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Button, Input, Select } from '@/shared/ui';
import { useAuth } from '../../model';
import { resendCodeApi } from '../../api';
import { getCategories } from '@/entities/category';
import type { Category } from '@/shared/types';
import styles from './RegisterForm.module.css';

const schema = z.object({
  fullName: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
  grade: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const RegisterForm = () => {
  const { register: authRegister, verifyEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const toggleInterest = (id: number) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      setLoading(true);
      await authRegister({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        grade: data.grade ? parseInt(data.grade) : undefined,
        interests: selectedInterests.length > 0 ? selectedInterests : undefined,
      });
      setEmail(data.email);
      setStep('code');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setError('');
      setLoading(true);
      await verifyEmail(email, code);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Неверный код');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await resendCodeApi(email);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка отправки');
    } finally {
      setResending(false);
    }
  };

  if (step === 'code') {
    return (
      <div className={styles.form}>
        <h1 className={styles.title}>Подтверждение email</h1>
        <p className={styles.subtitle}>
          Мы отправили 6-значный код на <strong>{email}</strong>
        </p>
        {error && <div className={styles.error}>{error}</div>}
        <Input
          label="Код подтверждения"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="000000"
          maxLength={6}
        />
        <Button onClick={handleVerify} loading={loading} size="lg">
          Подтвердить
        </Button>
        <Button variant="ghost" onClick={handleResend} loading={resending} size="sm">
          Отправить код повторно
        </Button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <h1 className={styles.title}>Регистрация</h1>
      {error && <div className={styles.error}>{error}</div>}
      <Input
        label="Полное имя"
        {...register('fullName')}
        error={errors.fullName?.message}
        placeholder="Иван Петров"
      />
      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        placeholder="your@email.com"
      />
      <Input
        label="Пароль"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        placeholder="Минимум 6 символов"
      />
      <Select
        label="Класс"
        {...register('grade')}
        placeholder="Выберите класс"
        options={[6, 7, 8, 9, 10, 11].map((g) => ({ value: String(g), label: `${g} класс` }))}
      />
      <div className={styles.interests}>
        <label className={styles.interestsLabel}>Интересы</label>
        <div className={styles.interestsList}>
          {categories.map((cat) => (
            <label key={cat.id} className={styles.interestItem}>
              <input
                type="checkbox"
                checked={selectedInterests.includes(cat.id)}
                onChange={() => toggleInterest(cat.id)}
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" loading={loading} size="lg">
        Зарегистрироваться
      </Button>
      <div className={styles.divider}><span>или</span></div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={async (response) => {
            if (response.credential) {
              try {
                await loginWithGoogle(response.credential);
                navigate('/');
              } catch (err: any) {
                setError(err.response?.data?.message || 'Ошибка входа через Google');
              }
            }
          }}
          onError={() => setError('Ошибка входа через Google')}
          text="signup_with"
          shape="rectangular"
          width="300"
        />
      </div>
      <p className={styles.link}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </form>
  );
};
