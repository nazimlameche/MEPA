'use client';

import { useSession } from 'next-auth/react';

export function useStreak() {
  const { data: session } = useSession();
  return {
    days: session?.user?.streakDays ?? 0,
    isActive: (session?.user?.streakDays ?? 0) > 0,
  };
}
