import debounce from 'lodash/debounce';
import type { DebounceSettings } from 'lodash';
import * as React from 'react';
import { useMemo, useRef, useCallback, useEffect } from 'react';

/**
 * A custom hook that returns a memoized version of the callback that
 * only changes if one of the dependencies has changed.
 * This is similar to useCallback but with a more convenient API.
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * A custom hook that returns a debounced version of the callback that
 * only changes if the dependencies change.
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = [],
  options?: DebounceSettings
): _.DebouncedFunc<T> {
  const debouncedFn = useMemo(
    () => debounce(callback, delay, options),
    [delay, ...deps] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
    // We don't want to recreate the debounced function when deps change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return debouncedFn;
}

/**
 * A custom hook that returns a memoized version of the value that
 * only changes if one of the dependencies has changed.
 * This is similar to useMemo but with a more convenient API.
 */
export function useMemoizedValue<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemo(factory, deps);
}

/**
 * A custom hook that keeps track of the previous value of a variable.
 * Useful for comparing previous and current props or state.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * A custom hook that returns a stable reference to a value that
 * only changes when the value itself changes.
 * This is useful for values that are expensive to calculate.
 */
export function useStableValue<T>(value: T): T {
  const ref = useRef(value);
  
  if (!Object.is(ref.current, value)) {
    ref.current = value;
  }
  
  return ref.current;
}
