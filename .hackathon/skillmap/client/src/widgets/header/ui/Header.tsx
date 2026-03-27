import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { useAuth } from '@/features/auth';
import { UserAvatar } from '@/entities/user';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/shared/api/notifications';
import type { Notification } from '@/shared/types';
import { useLocale } from '../../../context/LocaleContext';
import styles from './Header.module.css';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, toggle: toggleLocale } = useLocale();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    getUnreadCount().then(setUnreadCount).catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount().then(setUnreadCount).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleBellClick = async () => {
    if (!showDropdown) {
      const data = await getNotifications().catch(() => []);
      setNotifications(data);
    }
    setShowDropdown((v) => !v);
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      await markAsRead(n.id).catch(() => {});
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setShowDropdown(false);
    if (n.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    await markAllAsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          SkillMap
        </Link>

        <button
          className={styles.burger}
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          type="button"
          aria-label="Меню"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {user && (
          <nav
            className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Link to="/" className={`${styles.navLink} ${location.pathname === '/' ? styles.navLinkActive : ''}`}>
              Афиша
            </Link>
            <Link to="/courses" className={`${styles.navLink} ${location.pathname.startsWith('/courses') ? styles.navLinkActive : ''}`}>
              Курсы
            </Link>
            <Link to="/directions" className={`${styles.navLink} ${location.pathname.startsWith('/directions') ? styles.navLinkActive : ''}`}>
              Направления
            </Link>
            <Link to="/about" className={`${styles.navLink} ${location.pathname.startsWith('/about') ? styles.navLinkActive : ''}`}>
              О проекте
            </Link>
            {(user.role === 'ORGANIZER' || user.role === 'ADMIN') && (
              <Link to="/organizer" className={styles.navLink}>
                Организатор
              </Link>
            )}
            {user.role === 'ADMIN' && (
              <Link to="/admin" className={styles.navLink}>
                Админка
              </Link>
            )}
          </nav>
        )}

        <div className={styles.actions}>
          {user ? (
            <div className={styles.userMenu}>
              <button
                className={styles.langToggle}
                onClick={toggleLocale}
                type="button"
                aria-label="Переключить язык"
              >
                {locale === 'ru' ? 'EN' : 'RU'}
              </button>
              <Link to="/favorites" className={styles.favLink}>
                Избранное
              </Link>
              <div className={styles.bellWrapper} ref={dropdownRef}>
                <button className={styles.bell} onClick={handleBellClick} type="button" aria-label="Уведомления">
                  🔔
                  {unreadCount > 0 && (
                    <span className={styles.bellBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </button>
                {showDropdown && (
                  <div className={styles.notifDropdown}>
                    <div className={styles.notifHeader}>
                      <span>Уведомления</span>
                      {unreadCount > 0 && (
                        <button className={styles.markAll} onClick={handleMarkAll} type="button">
                          Прочитать все
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className={styles.notifEmpty}>Нет уведомлений</div>
                    ) : (
                      <ul className={styles.notifList}>
                        {notifications.map((n) => (
                          <li
                            key={n.id}
                            className={`${styles.notifItem} ${n.read ? '' : styles.notifUnread}`}
                            onClick={() => handleNotificationClick(n)}
                          >
                            <div className={styles.notifTitle}>{n.title}</div>
                            <div className={styles.notifMessage}>{n.message}</div>
                            <div className={styles.notifTime}>
                              {new Date(n.createdAt).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <Link to="/profile" className={styles.profileLink}>
                <UserAvatar
                  name={user.fullName}
                  photoUrl={user.telegramPhotoUrl}
                  size={32}
                />
                <span className={styles.userName}>{user.fullName}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Выйти
              </Button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <button
                className={styles.langToggle}
                onClick={toggleLocale}
                type="button"
                aria-label="Переключить язык"
              >
                {locale === 'ru' ? 'EN' : 'RU'}
              </button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Войти
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Регистрация
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
