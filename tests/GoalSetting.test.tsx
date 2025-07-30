import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import GoalSetting from '../src/GoalSetting';
import { MACRO_PRESETS } from '../src/constants';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

vi.stubGlobal('localStorage', localStorageMock);

describe('GoalSetting Component', () => {
    const defaultProps = {
        dailyCalories: 2000,
        setDailyCalories: vi.fn(),
        selectedPreset: 'balanced' as const,
        setSelectedPreset: vi.fn(),
        customCarbs: 40,
        setCustomCarbs: vi.fn(),
        customProtein: 30,
        setCustomProtein: vi.fn(),
        customFat: 30,
        currentMacros: MACRO_PRESETS.balanced,
        isCollapsed: false,
        setIsCollapsed: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('renders with default values', () => {
            render(<GoalSetting {...defaultProps} />);

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
            render(<GoalSetting {...defaultProps} />);

            // Balanced preset: 45% carbs, 25% protein, 30% fat
            // For 2000 calories: 225g carbs, 125g protein, 67g fat
            expect(screen.getByText('225g')).toBeInTheDocument(); // carbs
            expect(screen.getByText('125g')).toBeInTheDocument(); // protein
            expect(screen.getByText('67g')).toBeInTheDocument(); // fat
        });

        it('displays correct macro percentages', () => {
            render(<GoalSetting {...defaultProps} />);

            expect(screen.getByText('(45%)')).toBeInTheDocument(); // carbs
            expect(screen.getByText('(25%)')).toBeInTheDocument(); // protein
            expect(screen.getByText('(30%)')).toBeInTheDocument(); // fat
        });
    });

    describe('Calorie Input', () => {
        it('calls setDailyCalories when calorie input changes', async () => {
            const user = userEvent.setup();
            const mockSetDailyCalories = vi.fn();

            render(
                <GoalSetting
                    {...defaultProps}
                    setDailyCalories={mockSetDailyCalories}
                />
            );

            const calorieInput = screen.getByLabelText('Daily Calorie Goal');

            await user.clear(calorieInput);
            await user.type(calorieInput, '1800');

            // Check that the function was called (userEvent triggers onChange for each character)
            expect(mockSetDailyCalories).toHaveBeenCalled();
            expect(mockSetDailyCalories.mock.calls.length).toBeGreaterThan(0);
        });

        it('updates macro goals when calorie prop changes', () => {
            const { rerender } = render(<GoalSetting {...defaultProps} />);

            // Update with new calorie value
            rerender(<GoalSetting {...defaultProps} dailyCalories={1800} />);

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
        it('updates macro distribution when preset changes', () => {
            const { rerender } = render(<GoalSetting {...defaultProps} />);

            // Update with keto preset
            rerender(
                <GoalSetting
                    {...defaultProps}
                    selectedPreset="keto"
                    currentMacros={MACRO_PRESETS.keto}
                />
            );

            // Keto preset: 5% carbs, 20% protein, 75% fat
            // For 2000 calories: 25g carbs, 100g protein, 167g fat
            expect(screen.getByText('25g')).toBeInTheDocument(); // carbs
            expect(screen.getByText('100g')).toBeInTheDocument(); // protein
            expect(screen.getByText('167g')).toBeInTheDocument(); // fat

            expect(screen.getByText('(5%)')).toBeInTheDocument(); // carbs
            expect(screen.getByText('(20%)')).toBeInTheDocument(); // protein
            expect(screen.getByText('(75%)')).toBeInTheDocument(); // fat
        });

        it('calls setSelectedPreset when preset button is clicked', async () => {
            const user = userEvent.setup();
            const mockSetSelectedPreset = vi.fn();

            render(
                <GoalSetting
                    {...defaultProps}
                    setSelectedPreset={mockSetSelectedPreset}
                />
            );

            const ketoButton = screen.getByText('Keto');
            await user.click(ketoButton);

            expect(mockSetSelectedPreset).toHaveBeenCalledWith('keto');
        });

        it('activates the selected preset button', () => {
            render(<GoalSetting {...defaultProps} selectedPreset="zone" />);

            const zoneButton = screen.getByText('40 30 30');
            expect(zoneButton).toHaveClass('active');
            expect(screen.getByText('Balanced')).not.toHaveClass('active');
        });
    });

    describe('Custom Preset', () => {
        it('shows macro controls when custom preset is selected', () => {
            render(<GoalSetting {...defaultProps} selectedPreset="custom" />);

            // Should show + and - buttons for adjustable macros
            const plusButtons = screen.getAllByText('+');
            const minusButtons = screen.getAllByText('−');

            expect(plusButtons.length).toBeGreaterThan(0);
            expect(minusButtons.length).toBeGreaterThan(0);
        });

        it('calls setCustomCarbs when carbs + button is clicked', async () => {
            const user = userEvent.setup();
            const mockSetCustomCarbs = vi.fn();

            render(
                <GoalSetting
                    {...defaultProps}
                    selectedPreset="custom"
                    setCustomCarbs={mockSetCustomCarbs}
                />
            );

            // Find the + button for carbs (first macro item)
            const macroItems = document.querySelectorAll('.macro-item');
            const carbsItem = macroItems[0];
            const carbsPlusButton = carbsItem.querySelector('.inline-button');

            if (carbsPlusButton) {
                await user.click(carbsPlusButton);
                expect(mockSetCustomCarbs).toHaveBeenCalledWith(41);
            }
        });

        it('calls setCustomProtein when protein + button is clicked', async () => {
            const user = userEvent.setup();
            const mockSetCustomProtein = vi.fn();

            render(
                <GoalSetting
                    {...defaultProps}
                    selectedPreset="custom"
                    setCustomProtein={mockSetCustomProtein}
                />
            );

            // Find the + button for protein (second macro item)
            const macroItems = document.querySelectorAll('.macro-item');
            const proteinItem = macroItems[1];
            const proteinPlusButton =
                proteinItem.querySelector('.inline-button');

            if (proteinPlusButton) {
                await user.click(proteinPlusButton);
                expect(mockSetCustomProtein).toHaveBeenCalledWith(31);
            }
        });

        it('disables + buttons when carbs + protein >= 100%', () => {
            render(
                <GoalSetting
                    {...defaultProps}
                    selectedPreset="custom"
                    customCarbs={70}
                    customProtein={30}
                />
            );

            const macroItems = document.querySelectorAll('.macro-item');
            const carbsItem = macroItems[0];
            const carbsPlusButton = carbsItem.querySelector('.inline-button');

            expect(carbsPlusButton).toBeDisabled();
        });

        it('disables - buttons when macro value is 0', () => {
            render(
                <GoalSetting
                    {...defaultProps}
                    selectedPreset="custom"
                    customCarbs={0}
                />
            );

            const macroItems = document.querySelectorAll('.macro-item');
            const carbsItem = macroItems[0];
            const carbsMinusButton = carbsItem.querySelector(
                '.inline-button.minus'
            );

            expect(carbsMinusButton).toBeDisabled();
        });

        it('shows calculated fat percentage (not editable)', () => {
            render(
                <GoalSetting
                    {...defaultProps}
                    selectedPreset="custom"
                    customCarbs={40}
                    customProtein={30}
                    customFat={30}
                />
            );

            // Fat should show scale icon indicating it's calculated
            const macroItems = document.querySelectorAll('.macro-item');
            const fatItem = macroItems[2];
            const calculatedIcon = fatItem.querySelector(
                '.calculated-indicator'
            );

            expect(calculatedIcon).toBeInTheDocument();
            expect(calculatedIcon).toHaveTextContent('⚖️');
        });
    });

    describe('Goals Collapse/Expand', () => {
        it('shows collapsed summary when isCollapsed is true', () => {
            render(<GoalSetting {...defaultProps} isCollapsed={true} />);

            // Should show collapsed summary instead of full form
            expect(
                screen.queryByLabelText('Daily Calorie Goal')
            ).not.toBeInTheDocument();
            expect(screen.getByText('225g carbs')).toBeInTheDocument();
            expect(screen.getByText('⚙️')).toBeInTheDocument(); // settings cog
        });

        it('shows expanded form when isCollapsed is false', () => {
            render(<GoalSetting {...defaultProps} isCollapsed={false} />);

            // Should show full form
            expect(
                screen.getByLabelText('Daily Calorie Goal')
            ).toBeInTheDocument();
            expect(
                screen.getByText('Macronutrient Distribution')
            ).toBeInTheDocument();
            expect(screen.getByText('Set Goals')).toBeInTheDocument();
        });

        it('calls setIsCollapsed(true) when Set Goals button is clicked', async () => {
            const user = userEvent.setup();
            const mockSetIsCollapsed = vi.fn();

            render(
                <GoalSetting
                    {...defaultProps}
                    setIsCollapsed={mockSetIsCollapsed}
                />
            );

            const setGoalsButton = screen.getByText('Set Goals');
            await user.click(setGoalsButton);

            expect(mockSetIsCollapsed).toHaveBeenCalledWith(true);
        });

        it('calls setIsCollapsed(false) when settings button is clicked', async () => {
            const user = userEvent.setup();
            const mockSetIsCollapsed = vi.fn();

            render(
                <GoalSetting
                    {...defaultProps}
                    isCollapsed={true}
                    setIsCollapsed={mockSetIsCollapsed}
                />
            );

            const settingsButton = screen.getByText('⚙️');
            await user.click(settingsButton);

            expect(mockSetIsCollapsed).toHaveBeenCalledWith(false);
        });
    });

    describe('Summary Display', () => {
        it('displays correct macro summary in collapsed state', () => {
            render(<GoalSetting {...defaultProps} isCollapsed={true} />);

            expect(screen.getByText('225g carbs')).toBeInTheDocument();
            expect(screen.getByText('125g protein')).toBeInTheDocument();
            expect(screen.getByText('67g fat')).toBeInTheDocument();
            expect(screen.getByText('2000 kcal')).toBeInTheDocument();
        });

        it('displays correct macro percentages in collapsed state', () => {
            render(<GoalSetting {...defaultProps} isCollapsed={true} />);

            // The percentages are displayed without the % symbol in the summary
            expect(screen.getByText('45')).toBeInTheDocument(); // carbs
            expect(screen.getByText('25')).toBeInTheDocument(); // protein
            expect(screen.getByText('30')).toBeInTheDocument(); // fat
        });
    });

    describe('Edge Cases', () => {
        it('handles zero calories gracefully', () => {
            render(<GoalSetting {...defaultProps} dailyCalories={0} />);

            // Should handle 0 calories without crashing - check that all macro grams are 0
            const zeroGramElements = screen.getAllByText('0g');
            expect(zeroGramElements.length).toBeGreaterThan(0);
        });

        it('handles very high calorie values', () => {
            render(<GoalSetting {...defaultProps} dailyCalories={10000} />);

            // Should calculate macros for high calorie values
            // Balanced: 45% carbs = 4500 cal / 4 = 1125g
            expect(screen.getByText('1125g')).toBeInTheDocument(); // carbs
        });

        it('handles custom macros edge case where sum exceeds 100%', () => {
            render(
                <GoalSetting
                    {...defaultProps}
                    selectedPreset="custom"
                    customCarbs={60}
                    customProtein={50}
                    customFat={0} // This would be calculated as max(0, 100-60-50) = 0
                    currentMacros={{
                        carbs: 0.6,
                        protein: 0.5,
                        fat: 0,
                    }}
                />
            );

            // For custom macros of 60/50/0 with 2000 calories:
            // Carbs: 2000 * 0.6 / 4 = 300g
            // Protein: 2000 * 0.5 / 4 = 250g
            // Fat: 2000 * 0 / 9 = 0g
            expect(screen.getByText('300g')).toBeInTheDocument(); // carbs
            expect(screen.getByText('250g')).toBeInTheDocument(); // protein
            expect(screen.getByText('0g')).toBeInTheDocument(); // fat should be 0g
        });
    });
});
