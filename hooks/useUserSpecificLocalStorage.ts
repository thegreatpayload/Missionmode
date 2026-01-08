
import { useLocalStorage } from './useLocalStorage';
import React from 'react';

export function useUserSpecificLocalStorage<T>(
  key: string,
  initialValue: T,
  userId: string
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const userKey = `mission-mode-${key}-${userId}`;
  return useLocalStorage<T>(userKey, initialValue);
}
