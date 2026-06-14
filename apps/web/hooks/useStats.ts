'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import { mockUserProgress } from '@/lib/mock/dashboard-data';
import type { UserProgress } from '@/lib/types/dashboard';

interface ApiStats {
  totalXp:          number;
  level:            number;
  currentStreak:    number;
  longestStreak:    number;
  completedCourses: number;
}

const XP_PER_LEVEL = 500;

function apiStatsToUserProgress(api: ApiStats, totalCourses: number): UserProgress {
  return {
    xp:               api.totalXp % XP_PER_LEVEL,
    xpToNextLevel:    XP_PER_LEVEL,
    level:            api.level,
    streak:           api.currentStreak,
    completedCourses: api.completedCourses,
    totalCourses,
  };
}

export function useStats(totalCourses = 12) {
  const { data: session }       = useSession();
  const [stats, setStats]       = useState<UserProgress>(mockUserProgress);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const token = session?.accessToken;
    if (!token) { setLoading(false); return; }

    apiClient.get<ApiStats>('/progress/stats', token)
      .then(data => setStats(apiStatsToUserProgress(data, totalCourses)))
      .catch(() => setStats(mockUserProgress))
      .finally(() => setLoading(false));
  }, [session, totalCourses]);

  return { stats, loading };
}
