'use client';

import { useState, useCallback } from 'react';

export function useProgress(courseId: string) {
  const [status, setStatus] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');
  const [loading, setLoading] = useState(false);

  const update = useCallback(async (newStatus: 'in_progress' | 'completed') => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/api/progress/${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });
      if (res.ok) setStatus(newStatus);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  return { status, update, loading };
}
