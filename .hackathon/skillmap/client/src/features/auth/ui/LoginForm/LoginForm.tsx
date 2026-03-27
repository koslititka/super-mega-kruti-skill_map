import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Button, Input } from '@/shared/ui';
import { useAuth } from '../../model';
import styles from './LoginForm.module.css';

const schema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

type FormData = z.infer<typeof schema>;

export const LoginForm = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      setLoading(true);
      await login(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <h1 className={styles.title}>Вход</h1>
      {error && <div className={styles.error}>{error}</div>}
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
        placeholder="Введите пароль"
      />
      <Link to="/forgot-password" className={styles.forgotLink}>Забыли пароль?</Link>
      <Button type="submit" loading={loading} size="lg">
        Войти
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
          text="signin_with"
          shape="rectangular"
          width="300"
        />
      </div>
      <p className={styles.link}>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </form>
  );
};
