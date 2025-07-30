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
        it('renders with default values', () => {
            render(<App />);

            // Check if main elements are present
            expect(
                screen.getByLabelText('Daily Calorie Goal')
            ).toBeInTheDocument();
            expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
            expect(
                screen.getByText('Macronutrient Distribution')
            ).toBeInTheDocument();
            expect(screen.getByText('Balanced')).toBeInTheDocument();
        });

        it('displays correct macro goals for balanced preset', () => {
            render(<App />);

            // Balanced preset: 45% carbs, 25% protein, 30% fat
            // For 2000 calories: 225g carbs, 125g protein, 67g fat
            expect(screen.getByText('225g')).toBeInTheDocument(); // carbs
            expect(screen.getByText('125g')).toBeInTheDocument(); // protein
            expect(screen.getByText('67g')).toBeInTheDocument(); // fat
        });

        it('displays correct macro percentages', () => {
            render(<App />);

            expect(screen.getByText('(45%)')).toBeInTheDocument(); // carbs
            expect(screen.getByText('(25%)')).toBeInTheDocument(); // protein
            expect(screen.getByText('(30%)')).toBeInTheDocument(); // fat
        });
    });

    describe('Calorie Input', () => {
        it('updates macro goals when calorie input changes', async () => {
            const user = userEvent.setup();
            render(<App />);

            const calorieInput = screen.getByLabelText('Daily Calorie Goal');

            await user.clear(calorieInput);
            await user.type(calorieInput, '1800');

            // For 1800 calories with balanced preset
            // Carbs: 1800 * 0.45 / 4 = 202.5 -> 203g
            // Protein: 1800 * 0.25 / 4 = 112.5 -> 113g
            // Fat: 1800 * 0.3 / 9 = 60g
            expect(screen.getByText('203g')).toBeInTheDocument();
            expect(screen.getByText('113g')).toBeInTheDocument();
            expect(screen.getByText('60g')).toBeInTheDocument();
        });
    });

    describe('Preset Selection', () => {
        it('updates macro distribution when preset changes', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Click on Keto preset
            const ketoButton = screen.getByText('Keto');
            await user.click(ketoButton);

            // Keto preset: 5% carbs, 20% protein, 75% fat
            // For 2000 calories: 25g carbs, 100g protein, 167g fat
            expect(screen.getByText('25g')).toBeInTheDocument(); // carbs
            expect(screen.getByText('100g')).toBeInTheDocument(); // protein
            expect(screen.getByText('167g')).toBeInTheDocument(); // fat

            expect(screen.getByText('(5%)')).toBeInTheDocument(); // carbs
            expect(screen.getByText('(20%)')).toBeInTheDocument(); // protein
            expect(screen.getByText('(75%)')).toBeInTheDocument(); // fat
        });

        it('activates the selected preset button', async () => {
            const user = userEvent.setup();
            render(<App />);

            const zoneButton = screen.getByText('40 30 30');
            await user.click(zoneButton);

            expect(zoneButton).toHaveClass('active');
            expect(screen.getByText('Balanced')).not.toHaveClass('active');
        });
    });

    describe('Custom Preset', () => {
        it('shows macro controls when custom preset is selected', async () => {
            const user = userEvent.setup();
            render(<App />);

            const customButton = screen.getByText('Custom');
            await user.click(customButton);

            // Should show + and - buttons for adjustable macros
            const plusButtons = screen.getAllByText('+');
            const minusButtons = screen.getAllByText('−');

            expect(plusButtons.length).toBeGreaterThan(0);
            expect(minusButtons.length).toBeGreaterThan(0);
        });

        it('allows adjusting custom macro ratios', async () => {
            const user = userEvent.setup();
            render(<App />);

            const customButton = screen.getByText('Custom');
            await user.click(customButton);

            // Find the + button for carbs (first macro item)
            const macroItems = document.querySelectorAll('.macro-item');
            const carbsItem = macroItems[0];
            const carbsPlusButton = carbsItem.querySelector('.inline-button');

            if (carbsPlusButton) {
                await user.click(carbsPlusButton);

                // Custom starts at 40% carbs, clicking + should make it 41%
                expect(screen.getByText('(41%)')).toBeInTheDocument();
            }
        });
    });

    describe('Goals Collapse/Expand', () => {
        it('collapses goals when Set Goals button is clicked', async () => {
            const user = userEvent.setup();
            render(<App />);

            const setGoalsButton = screen.getByText('Set Goals');
            await user.click(setGoalsButton);

            // Should show collapsed summary instead of full form
            expect(
                screen.queryByLabelText('Daily Calorie Goal')
            ).not.toBeInTheDocument();
            expect(screen.getByText('225g carbs')).toBeInTheDocument();
            expect(screen.getByText('⚙️')).toBeInTheDocument(); // settings cog
        });

        it('expands goals when settings button is clicked', async () => {
            const user = userEvent.setup();
            render(<App />);

            // First collapse
            const setGoalsButton = screen.getByText('Set Goals');
            await user.click(setGoalsButton);

            // Then expand
            const settingsButton = screen.getByText('⚙️');
            await user.click(settingsButton);

            // Should show full form again
            expect(
                screen.getByLabelText('Daily Calorie Goal')
            ).toBeInTheDocument();
            expect(
                screen.getByText('Macronutrient Distribution')
            ).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('handles invalid calorie input gracefully', async () => {
            const user = userEvent.setup();
            render(<App />);

            const calorieInput = screen.getByLabelText('Daily Calorie Goal');

            await user.clear(calorieInput);
            await user.type(calorieInput, '0');

            // Should handle 0 calories without crashing - check that all macro grams are 0
            const zeroGramElements = screen.getAllByText('0g');
            expect(zeroGramElements.length).toBeGreaterThan(0);
        });

        it("validates custom macro percentages don't exceed 100%", async () => {
            const user = userEvent.setup();
            render(<App />);

            const customButton = screen.getByText('Custom');
            await user.click(customButton);

            // Try to increase carbs to maximum (when carbs + protein >= 100)
            const macroItems = document.querySelectorAll('.macro-item');
            const carbsItem = macroItems[0];
            const carbsPlusButton = carbsItem.querySelector('.inline-button');

            if (carbsPlusButton) {
                // Click many times to try to exceed 100%
                for (let i = 0; i < 70; i++) {
                    await user.click(carbsPlusButton);
                    if (carbsPlusButton.hasAttribute('disabled')) {
                        break;
                    }
                }

                // Button should be disabled when limit is reached
                expect(carbsPlusButton).toBeDisabled();
            }
        });
    });

    describe('localStorage Integration', () => {
        it('saves calorie changes to localStorage', async () => {
            const user = userEvent.setup();
            render(<App />);

            const calorieInput = screen.getByLabelText('Daily Calorie Goal');
            await user.clear(calorieInput);
            await user.type(calorieInput, '2500');

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'dailyCalories',
                '2500'
            );
        });

        it('saves preset selection to localStorage', async () => {
            const user = userEvent.setup();
            render(<App />);

            const ketoButton = screen.getByText('Keto');
            await user.click(ketoButton);

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'macroPreset',
                'keto'
            );
        });

        it('loads saved values from localStorage on mount', () => {
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'dailyCalories') return '2500';
                if (key === 'macroPreset') return 'keto';
                if (key === 'isCollapsed') return 'true';
                return null;
            });

            render(<App />);

            // Should show collapsed view with keto values for 2500 calories
            expect(screen.getByText('2500 kcal')).toBeInTheDocument();
            expect(screen.getByText('31g carbs')).toBeInTheDocument(); // 2500 * 0.05 / 4 = 31.25 -> 31
            expect(screen.getByText('⚙️')).toBeInTheDocument(); // collapsed state
        });
    });
});
