import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../src/hooks/useLocalStorage';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

vi.stubGlobal('localStorage', localStorageMock);

describe('useLocalStorage Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initialization', () => {
        it('returns default value when localStorage is empty', () => {
            localStorageMock.getItem.mockReturnValue(null);

            const { result } = renderHook(() =>
                useLocalStorage('test-key', 'default')
            );

            expect(result.current[0]).toBe('default');
            expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
        });

        it('parses stored string value correctly', () => {
            localStorageMock.getItem.mockReturnValue('stored-value');

            const { result } = renderHook(() =>
                useLocalStorage('test-key', 'default')
            );

            expect(result.current[0]).toBe('stored-value');
        });

        it('parses stored number value correctly', () => {
            localStorageMock.getItem.mockReturnValue('42');

            const { result } = renderHook(() => useLocalStorage('test-key', 0));

            expect(result.current[0]).toBe(42);
        });

        it('parses stored boolean value correctly', () => {
            localStorageMock.getItem.mockReturnValue('true');

            const { result } = renderHook(() =>
                useLocalStorage('test-key', false)
            );

            expect(result.current[0]).toBe(true);
        });

        it('parses stored object value correctly', () => {
            const testObject = { name: 'test', value: 123 };
            localStorageMock.getItem.mockReturnValue(
                JSON.stringify(testObject)
            );

            const { result } = renderHook(() =>
                useLocalStorage('test-key', {})
            );

            expect(result.current[0]).toEqual(testObject);
        });

        it('parses stored array value correctly', () => {
            const testArray = [1, 2, 3];
            localStorageMock.getItem.mockReturnValue(JSON.stringify(testArray));

            const { result } = renderHook(() =>
                useLocalStorage('test-key', [])
            );

            expect(result.current[0]).toEqual(testArray);
        });

        it('returns default value when localStorage parsing fails', () => {
            localStorageMock.getItem.mockReturnValue('invalid-json');

            const { result } = renderHook(() =>
                useLocalStorage('test-key', { default: true })
            );

            expect(result.current[0]).toEqual({ default: true });
        });
    });

    describe('value updates', () => {
        it('updates value and saves to localStorage for strings', () => {
            localStorageMock.getItem.mockReturnValue(null);

            const { result } = renderHook(() =>
                useLocalStorage('test-key', 'default')
            );

            act(() => {
                result.current[1]('new-value');
            });

            expect(result.current[0]).toBe('new-value');
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'test-key',
                'new-value'
            );
        });

        it('updates value and saves to localStorage for numbers', () => {
            localStorageMock.getItem.mockReturnValue(null);

            const { result } = renderHook(() => useLocalStorage('test-key', 0));

            act(() => {
                result.current[1](42);
            });

            expect(result.current[0]).toBe(42);
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'test-key',
                '42'
            );
        });

        it('updates value and saves to localStorage for booleans', () => {
            localStorageMock.getItem.mockReturnValue(null);

            const { result } = renderHook(() =>
                useLocalStorage('test-key', false)
            );

            act(() => {
                result.current[1](true);
            });

            expect(result.current[0]).toBe(true);
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'test-key',
                'true'
            );
        });

        it('updates value and saves to localStorage for objects', () => {
            localStorageMock.getItem.mockReturnValue(null);
            const testObject = { name: 'test', value: 123 };

            const { result } = renderHook(() =>
                useLocalStorage('test-key', {})
            );

            act(() => {
                result.current[1](testObject);
            });

            expect(result.current[0]).toEqual(testObject);
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'test-key',
                JSON.stringify(testObject)
            );
        });

        it('handles localStorage save errors gracefully', () => {
            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });

            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            const { result } = renderHook(() =>
                useLocalStorage('test-key', 'default')
            );

            act(() => {
                result.current[1]('new-value');
            });

            expect(result.current[0]).toBe('new-value');
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to save test-key to localStorage:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('regression tests for specific use cases', () => {
        it('handles macro preset keys correctly', () => {
            localStorageMock.getItem.mockReturnValue('balanced');

            const { result } = renderHook(() =>
                useLocalStorage('macroPreset', 'balanced' as const)
            );

            expect(result.current[0]).toBe('balanced');
        });

        it('handles daily calories correctly', () => {
            localStorageMock.getItem.mockReturnValue('2000');

            const { result } = renderHook(() =>
                useLocalStorage('dailyCalories', 0)
            );

            expect(result.current[0]).toBe(2000);
        });

        it('handles meals array correctly', () => {
            const meals = [
                { id: '1', name: 'Breakfast', carbs: 50, protein: 20, fat: 15 },
                { id: '2', name: 'Lunch', carbs: 60, protein: 30, fat: 20 },
            ];
            localStorageMock.getItem.mockReturnValue(JSON.stringify(meals));

            const { result } = renderHook(() => useLocalStorage('meals', []));

            expect(result.current[0]).toEqual(meals);
        });

        it('handles collapsed state correctly', () => {
            localStorageMock.getItem.mockReturnValue('true');

            const { result } = renderHook(() =>
                useLocalStorage('isCollapsed', false)
            );

            expect(result.current[0]).toBe(true);
        });
    });
});
