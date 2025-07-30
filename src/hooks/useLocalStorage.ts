import { useState, useEffect } from 'react';

/**
 * Custom hook for localStorage with automatic serialization
 */
export function useLocalStorage<T>(
    key: string,
    defaultValue: T
): [T, (value: T) => void] {
    const [value, setValue] = useState<T>(() => {
        try {
            const saved = localStorage.getItem(key);
            if (saved === null) return defaultValue;

            // Handle different types appropriately
            if (typeof defaultValue === 'number') {
                return Number(saved) as T;
            }
            if (typeof defaultValue === 'boolean') {
                return JSON.parse(saved) as T;
            }
            if (typeof defaultValue === 'string') {
                return saved as T;
            }
            // For objects and arrays
            return JSON.parse(saved) as T;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            if (typeof value === 'string') {
                localStorage.setItem(key, value);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.warn(`Failed to save ${key} to localStorage:`, error);
        }
    }, [key, value]);

    return [value, setValue];
}
