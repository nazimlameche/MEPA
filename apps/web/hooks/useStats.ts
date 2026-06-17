'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import { EMPTY_PROGRESS, XP_PER_LEVEL, apiStatsToProgress, type ApiStats } from '@/lib/progress/derive';
import type { UserProgress } from '@/lib/types/dashboard';

export function useStats(totalCourses?: number) {
  const { data: session }     = useSession();
  const [stats, setStats]     = useState<UserProgress>(EMPTY_PROGRESS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = session?.accessToken;
    if (!token) { setLoading(false); return; }

    apiClient.get<ApiStats>('/progress/stats', token)
      .then(data => {
        const p = apiStatsToProgress(data);
        setStats(totalCourses !== undefined ? { ...p, totalCourses } : p);
      })
      .catch(() => setStats(EMPTY_PROGRESS))
      .finally(() => setLoading(false));
  }, [session, totalCourses]);

  return { stats, loading, XP_PER_LEVEL };
}
