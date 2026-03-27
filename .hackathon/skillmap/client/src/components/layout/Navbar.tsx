import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLocale } from '../../context/LocaleContext';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from '../auth/AuthModal';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { key: 'feed' as const, path: '/' },
  { key: 'courses' as const, path: '/courses' },
  { key: 'directions' as const, path: '/directions' },
  { key: 'about' as const, path: '/about' },
] as const;

export function Navbar() {
  const { t, locale, toggle } = useLocale();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <header className={styles.navbar}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link to="/" className={styles.logo} onClick={closeMenu}>
            <span className={styles.logoIcon}>SM</span>
            <span className={styles.logoText}>
              Skill<span className={styles.logoAccent}>Map</span>
            </span>
          </Link>

          {/* Center nav — desktop */}
          <nav className={styles.navLinks} aria-label="Основная навигация">
            {NAV_LINKS.map(({ key, path }) => (
              <Link
                key={key}
                to={path}
                className={`${styles.navLink}${isActive(path) ? ` ${styles.navLinkActive}` : ''}`}
              >
                {t.nav[key]}
              </Link>
            ))}
          </nav>

          {/* Right actions — desktop */}
          <div className={styles.actions}>
            <button className={styles.langToggle} onClick={toggle} type="button">
              {locale === 'ru' ? 'EN' : 'RU'}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/account" className={styles.profileLink}>
                  <span className={styles.avatar}>{user!.fullName.charAt(0).toUpperCase()}</span>
                  <span className={styles.profileName}>{user!.fullName.split(' ')[0]}</span>
                </Link>
                <button type="button" className={styles.btnLogin} onClick={handleLogout}>
                  Выйти
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.btnLogin}
                  onClick={() => setShowAuth('login')}
                >
                  {t.nav.signin}
                </button>
                <button
                  type="button"
                  className={styles.btnRegister}
                  onClick={() => setShowAuth('register')}
                >
                  {t.nav.register}
                </button>
              </>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button
            className={styles.burger}
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={isMenuOpen}
            type="button"
          >
            {isMenuOpen ? (
              <span className={styles.burgerClose}>✕</span>
            ) : (
              <>
                <span className={styles.burgerLine} />
                <span className={styles.burgerLine} />
                <span className={styles.burgerLine} />
              </>
            )}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <>
          <div className={styles.overlay} onClick={closeMenu} aria-hidden="true" />
          <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Мобильное меню">
            <nav className={styles.drawerNav}>
              {NAV_LINKS.map(({ key, path }) => (
                <Link
                  key={key}
                  to={path}
                  className={`${styles.drawerLink}${isActive(path) ? ` ${styles.drawerLinkActive}` : ''}`}
                  onClick={closeMenu}
                >
                  {t.nav[key]}
                </Link>
              ))}
              {isAuthenticated && (
                <Link to="/account" className={styles.drawerLink} onClick={closeMenu}>
                  {t.profile.title}
                </Link>
              )}
            </nav>
            <div className={styles.drawerActions}>
              <button className={styles.langToggle} onClick={toggle} type="button">
                {locale === 'ru' ? 'EN' : 'RU'}
              </button>
              {isAuthenticated ? (
                <button
                  type="button"
                  className={styles.btnLogin}
                  onClick={() => { handleLogout(); closeMenu(); }}
                >
                  Выйти
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.btnLogin}
                    onClick={() => { setShowAuth('login'); closeMenu(); }}
                  >
                    {t.nav.signin}
                  </button>
                  <button
                    type="button"
                    className={styles.btnRegister}
                    onClick={() => { setShowAuth('register'); closeMenu(); }}
                  >
                    {t.nav.register}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Auth modal */}
      {showAuth && (
        <AuthModal
          initialMode={showAuth}
          onClose={() => setShowAuth(null)}
        />
      )}
    </>
  );
}
