import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <span className={styles.brand}>SkillMap</span>
        <span className={styles.copy}>2026. Агрегатор IT-мероприятий для школьников</span>
      </div>
    </footer>
  );
};
