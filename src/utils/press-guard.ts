import { useCallback, useRef } from 'react';

/** Ignores overlapping presses until the handler finishes (sync or async). */
export const guardPress = <Args extends unknown[]>(
  handler: ((...args: Args) => void | Promise<void>) | null | undefined,
): ((...args: Args) => void) | undefined => {
  if (!handler) return undefined;

  let locked = false;

  return (...args: Args) => {
    if (locked) return;

    locked = true;

    try {
      const result = handler(...args);

      if (result instanceof Promise) {
        void result.finally(() => {
          locked = false;
        });
        return;
      }

      locked = false;
    } catch (error) {
      locked = false;
      throw error;
    }
  };
};

export const useGuardedPress = <Args extends unknown[]>(
  handler: ((...args: Args) => void | Promise<void>) | undefined,
): ((...args: Args) => void) | undefined => {
  const lockRef = useRef(false);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  return useCallback(
    (...args: Args) => {
      const fn = handlerRef.current;
      if (!fn || lockRef.current) return;

      lockRef.current = true;

      try {
        const result = fn(...args);

        if (result instanceof Promise) {
          void result.finally(() => {
            lockRef.current = false;
          });
          return;
        }

        lockRef.current = false;
      } catch (error) {
        lockRef.current = false;
        throw error;
      }
    },
    [],
  );
};
