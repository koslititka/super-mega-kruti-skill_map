import { ReactNode } from 'react';
import styles from './Badge.module.css';
import { cn } from '../../lib';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
}

export const Badge = ({ variant = 'default', children, className }: BadgeProps) => {
  return (
    <span className={cn(styles.badge, styles[variant], className)}>
      {children}
    </span>
  );
};
