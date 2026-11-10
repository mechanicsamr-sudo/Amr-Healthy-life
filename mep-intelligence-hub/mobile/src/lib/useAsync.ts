import { useCallback, useEffect, useState } from 'react';

type State<T> = { data: T | null; error: unknown; loading: boolean };

/** Minimal data-loading hook with reload support. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: true });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await run();
      setState({ data, error: null, loading: false });
    } catch (error) {
      setState({ data: null, error, loading: false });
    }
  }, [run]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { ...state, reload };
}
