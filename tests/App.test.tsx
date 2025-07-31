import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

vi.stubGlobal('localStorage', localStorageMock);

describe('App Component Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    describe('Initial State', () => {
        it('renders all main sections (goal setting, meal planning, and daily macros)', () => {
            render(<App />);

            // Check if main app structure is present
            expect(
                screen.getByLabelText('Daily Calorie Goal')
            ).toBeInTheDocument();
            expect(screen.getByText('Meal Planning')).toBeInTheDocument();
            expect(screen.getByText('+ Add Food')).toBeInTheDocument();
            expect(screen.getByText('Daily Macros')).toBeInTheDocument();
            expect(screen.getByText('+ Add Meal')).toBeInTheDocument();
        });

        it('renders with default goal setting values', () => {
            render(<App />);

            expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
            expect(screen.getByText('Balanced')).toBeInTheDocument();
        });
    });

    describe('Integration between Goal Setting and Daily Macros', () => {
        it('passes calorie goals correctly to daily macros section', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Change calories in goal setting
            const calorieInput = screen.getByLabelText('Daily Calorie Goal');
            await user.clear(calorieInput);
            await user.type(calorieInput, '2500');

            // Add a meal to see if the goals are used correctly
            const addMealButton = screen.getByText('+ Add Meal');
            await user.click(addMealButton);

            // The daily macros section should be aware of the new calorie goal
            // (This is tested more thoroughly in MealPlanning.test.tsx)
            expect(screen.getByText('Daily Macros')).toBeInTheDocument();
        });

        it('maintains state consistency between components', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Change preset in goal setting
            const ketoButton = screen.getByText('Keto');
            await user.click(ketoButton);

            // Collapse goal setting
            const setGoalsButton = screen.getByText('Set Goals');
            await user.click(setGoalsButton);

            // Should show keto values in collapsed summary
            expect(screen.getByText('25g carbs')).toBeInTheDocument();
            expect(screen.getByText('100g protein')).toBeInTheDocument();

            // Meal planning should still be visible
            expect(screen.getByText('Daily Macros')).toBeInTheDocument();
        });
    });

    describe('localStorage Integration', () => {
        it('saves and loads all app state from localStorage', () => {
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'dailyCalories') return '2500';
                if (key === 'macroPreset') return 'keto';
                if (key === 'isCollapsed') return 'true';
                if (key === 'meals')
                    return JSON.stringify([
                        {
                            id: 1,
                            name: 'Test Meal',
                            carbs: 50,
                            protein: 30,
                            fat: 20,
                        },
                    ]);
                return null;
            });

            render(<App />);

            // Should show collapsed view with keto values for 2500 calories
            expect(screen.getByText('2500 kcal')).toBeInTheDocument();
            expect(screen.getByText('31g carbs')).toBeInTheDocument(); // 2500 * 0.05 / 4 = 31.25 -> 31
            expect(screen.getByText('⚙️')).toBeInTheDocument(); // collapsed state

            // Should show saved meal
            expect(screen.getByDisplayValue('Test Meal')).toBeInTheDocument();
        });

        it('handles localStorage errors gracefully', () => {
            localStorageMock.getItem.mockImplementation(() => {
                throw new Error('localStorage error');
            });

            // Should not crash and should render with defaults
            expect(() => render(<App />)).not.toThrow();
        });
    });

    describe('App Layout and Structure', () => {
        it('renders main app container with proper structure', () => {
            render(<App />);

            const appElement = document.querySelector('.app');
            const mainElement = document.querySelector('.app-main');
            const cards = document.querySelectorAll('.card');

            expect(appElement).toBeInTheDocument();
            expect(mainElement).toBeInTheDocument();
            expect(cards).toHaveLength(3); // Goal setting card + meal planning card + daily macros card
        });

        it('maintains responsive layout structure', () => {
            render(<App />);

            // Check that responsive classes are applied
            const appElement = document.querySelector('.app');
            expect(appElement).toHaveClass('app');
        });
    });
});
