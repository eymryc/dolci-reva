/**
 * Utilitaires pour optimiser les performances
 */

import React, { useCallback, useMemo } from "react";

/**
 * Debounce function pour limiter les appels de fonction
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      (func as (...args: unknown[]) => unknown)(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function pour limiter la fréquence d'exécution
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      (func as (...args: unknown[]) => unknown)(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Hook pour mémoriser une fonction avec useCallback
 * Utile pour éviter les re-renders inutiles
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList
): T {
  // This wrapper intentionally forwards the callback to useCallback. Call sites are responsible
  // for providing the correct dependency list.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps) as T;
}

/**
 * Hook pour mémoriser une valeur avec useMemo
 * Utile pour les calculs coûteux
 */
export function useStableMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  // This wrapper intentionally forwards the factory to useMemo. Call sites are responsible
  // for providing the correct dependency list.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

/**
 * Lazy load component wrapper
 */
export function lazyLoad<T extends React.ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc);
}

