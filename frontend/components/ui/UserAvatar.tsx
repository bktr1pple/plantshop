'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { User } from '@/app/types/dashboard';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <motion.div
      className={`
        ${sizeClasses[size]} 
        relative overflow-hidden
        bg-gradient-to-r from-emerald-500 to-green-600 
        rounded-full flex items-center justify-center 
        text-white font-black shadow-lg
      `}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {user.avatar ? (
        <Image
          src={user.avatar}
          alt={user.name}
          fill
          sizes={size === 'lg' ? '64px' : size === 'md' ? '48px' : '32px'}
          className="rounded-full object-cover"
        />
      ) : (
        getInitials(user.name)
      )}
    </motion.div>
  );
}
