import { useState } from 'react';
import { useAuth } from '@/features/auth';
import { useToast } from '@/shared/ui';
import { addFavorite, removeFavorite } from '../../api';
import styles from './FavoriteButton.module.css';
import { cn } from '@/shared/lib';

interface FavoriteButtonProps {
  eventId: number;
  isFavorite: boolean;
  onToggle?: () => void;
}

export const FavoriteButton = ({ eventId, isFavorite, onToggle }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [fav, setFav] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Войдите, чтобы добавить в избранное', 'info');
      return;
    }

    try {
      setLoading(true);
      if (fav) {
        await removeFavorite(eventId);
        setFav(false);
      } else {
        await addFavorite(eventId);
        setFav(true);
      }
      onToggle?.();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Ошибка', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={cn(styles.button, fav && styles.active)}
      onClick={handleClick}
      disabled={loading}
      title={fav ? 'Убрать из избранного' : 'В избранное'}
    >
      {fav ? '\u2764' : '\u2661'}
    </button>
  );
};
