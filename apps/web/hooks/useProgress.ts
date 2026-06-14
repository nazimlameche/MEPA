'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';

interface CompletionPayload {
  xpReward: number;
  score:    number;
}

export function useProgress(courseId: string) {
  const { data: session }     = useSession();
  const [status, setStatus]   = useState<'not_started' | 'in_progress' | 'completed'>('not_started');
  const [loading, setLoading] = useState(false);

  const update = useCallback(
    async (newStatus: 'in_progress' | 'completed', completion?: CompletionPayload) => {
      const token = session?.accessToken;
      setLoading(true);
      try {
        if (newStatus === 'in_progress') {
          await apiClient.post(`/progress/courses/${courseId}/start`, {}, token);
        } else {
          // 'completed' → le backend exige { xpReward, score }
          await apiClient.post(
            `/progress/courses/${courseId}/complete`,
            { xpReward: completion?.xpReward ?? 0, score: completion?.score ?? 0 },
            token,
          );
        }
        setStatus(newStatus);
      } catch {
        // Échec silencieux — l'état local n'est pas modifié si la persistance échoue
      } finally {
        setLoading(false);
      }
    },
    [courseId, session?.accessToken],
  );

  return { status, update, loading };
}
