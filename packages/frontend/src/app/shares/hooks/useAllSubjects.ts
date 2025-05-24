import { useEffect, useState } from 'react';
import { getAllSubjects } from '../services/suiSharesService';

export function useAllSubjects(sharesTradingObjectId: string) {
  const [data, setData] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchSubjects() {
      setLoading(true);
      setError(null);
      try {
        const subjects = await getAllSubjects(sharesTradingObjectId);
        if (!cancelled) setData(subjects);
      } catch (e: unknown) {
        if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
          if (!cancelled) setError((e as { message: string }).message);
        } else {
          if (!cancelled) setError('Failed to fetch subjects');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSubjects();
    return () => { cancelled = true; };
  }, [sharesTradingObjectId]);

  return { data, loading, error };
} 