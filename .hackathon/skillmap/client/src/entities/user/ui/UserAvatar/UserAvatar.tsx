import styles from './UserAvatar.module.css';

interface UserAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: number;
}

export const UserAvatar = ({ name, photoUrl, size = 40 }: UserAvatarProps) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={styles.avatar}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div className={styles.placeholder} style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials}
    </div>
  );
};
