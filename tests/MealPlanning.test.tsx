import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MealPlanning, { type Meal } from '../src/MealPlanning';
import type { MacroRatios } from '../src/constants';

describe('MealPlanning Component', () => {
    const mockSetMeals = vi.fn();

    const defaultProps = {
        meals: [] as Meal[],
        setMeals: mockSetMeals,
        dailyCalories: 2000,
        currentMacros: {
            carbs: 0.45,
            protein: 0.25,
            fat: 0.3,
        } as MacroRatios,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('renders meal planning section with add meal button', () => {
            render(<MealPlanning {...defaultProps} />);

            expect(screen.getByText('Meal Planning')).toBeInTheDocument();
            expect(screen.getByText('+ Add Meal')).toBeInTheDocument();
        });

        it('shows empty state when no meals', () => {
            render(<MealPlanning {...defaultProps} />);

            // Should show only the header and add button when no meals
            expect(screen.getByText('Meal Planning')).toBeInTheDocument();
            expect(screen.getByText('+ Add Meal')).toBeInTheDocument();

            // Should not show macro tracking charts when empty
            expect(screen.queryByText('Carbs')).not.toBeInTheDocument();
        });
    });

    describe('Adding Meals', () => {
        it('calls setMeals when add meal button is clicked', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            const addButton = screen.getByText('+ Add Meal');
            await user.click(addButton);

            expect(mockSetMeals).toHaveBeenCalledWith([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: 'Meal 1',
                    carbs: 0,
                    protein: 0,
                    fat: 0,
                }),
            ]);
        });
    });

    describe('Existing Meals', () => {
        const sampleMeals: Meal[] = [
            { id: 1, name: 'Breakfast', carbs: 50, protein: 20, fat: 15 },
            { id: 2, name: 'Lunch', carbs: 60, protein: 30, fat: 20 },
        ];

        it('displays existing meals', () => {
            render(<MealPlanning {...defaultProps} meals={sampleMeals} />);

            expect(screen.getByDisplayValue('Breakfast')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Lunch')).toBeInTheDocument();
            expect(screen.getByDisplayValue('50')).toBeInTheDocument(); // breakfast carbs
            expect(screen.getByDisplayValue('60')).toBeInTheDocument(); // lunch carbs
        });

        it('calculates total macros correctly', () => {
            render(<MealPlanning {...defaultProps} meals={sampleMeals} />);

            // Total: 110g carbs, 50g protein, 35g fat
            // Against goals of 225g carbs, 125g protein, 67g fat
            expect(
                screen.getByText('110g / 225g (49% DV)')
            ).toBeInTheDocument(); // carbs
            expect(screen.getByText('50g / 125g (40% DV)')).toBeInTheDocument(); // protein
            expect(screen.getByText('35g / 67g (52% DV)')).toBeInTheDocument(); // fat
        });

        it('shows progress bars for macro tracking', () => {
            render(<MealPlanning {...defaultProps} meals={sampleMeals} />);

            // Should show progress bars (including calories)
            const progressBars = document.querySelectorAll('.progress-bar');
            expect(progressBars.length).toBe(4); // carbs, protein, fat, calories
        });

        it('handles meal updates', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} meals={sampleMeals} />);

            // Test updating a macro value - focus on the macro input and type
            const carbsInput = screen.getByDisplayValue('50'); // breakfast carbs
            await user.click(carbsInput);
            await user.type(carbsInput, '5'); // Just add a 5, making it 505

            // Check that setMeals was called
            expect(mockSetMeals).toHaveBeenCalled();

            // Check that the updateMeal function works - it should have called setMeals
            // with an array containing meals with the correct structure
            const calls = mockSetMeals.mock.calls;
            const lastCall = calls[calls.length - 1];
            const updatedMeals = lastCall[0];

            // Verify structure and that first meal was updated
            expect(updatedMeals).toHaveLength(2);
            expect(updatedMeals[0]).toHaveProperty('id', 1);
            expect(updatedMeals[0]).toHaveProperty('name', 'Breakfast');
            expect(updatedMeals[0]).toHaveProperty('carbs');
            expect(updatedMeals[0].carbs).not.toBe(50); // Should be different from original
            expect(updatedMeals[1]).toEqual({
                id: 2,
                name: 'Lunch',
                carbs: 60,
                protein: 30,
                fat: 20,
            });
        });
        it('handles meal deletion', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} meals={sampleMeals} />);

            const deleteButtons = screen.getAllByText('🗑');
            await user.click(deleteButtons[0]); // delete first meal

            expect(mockSetMeals).toHaveBeenCalledWith([
                { id: 2, name: 'Lunch', carbs: 60, protein: 30, fat: 20 },
            ]);
        });
    });

    describe('Macro Progress Tracking', () => {
        it('shows overflow when macros exceed goals', () => {
            const highMacroMeals: Meal[] = [
                {
                    id: 1,
                    name: 'High Carb Meal',
                    carbs: 300,
                    protein: 50,
                    fat: 30,
                }, // exceeds carb goal
            ];

            render(<MealPlanning {...defaultProps} meals={highMacroMeals} />);

            // Should show over 100% for carbs
            expect(
                screen.getByText('300g / 225g (133% DV)')
            ).toBeInTheDocument();

            // Should have overflow styling
            const overflowElements =
                document.querySelectorAll('.progress-overflow');
            expect(overflowElements.length).toBeGreaterThan(0);
        });

        it('caps progress bars at 100% visually', () => {
            const highMacroMeals: Meal[] = [
                {
                    id: 1,
                    name: 'Extreme Meal',
                    carbs: 1000,
                    protein: 500,
                    fat: 300,
                },
            ];

            render(<MealPlanning {...defaultProps} meals={highMacroMeals} />);

            // Progress bars should not exceed 100% width
            const progressFills = document.querySelectorAll('.progress-fill');
            progressFills.forEach((fill) => {
                const width = (fill as HTMLElement).style.width;
                const widthValue = parseFloat(width.replace('%', ''));
                expect(widthValue).toBeLessThanOrEqual(100);
            });
        });
    });

    describe('Edge Cases', () => {
        it('handles zero calorie goals', () => {
            render(<MealPlanning {...defaultProps} dailyCalories={0} />);

            // Should not crash with division by zero
            expect(screen.getByText('Meal Planning')).toBeInTheDocument();
        });

        it('handles meals with zero macros', () => {
            const zeroMacroMeals: Meal[] = [
                { id: 1, name: 'Water', carbs: 0, protein: 0, fat: 0 },
            ];

            render(<MealPlanning {...defaultProps} meals={zeroMacroMeals} />);

            expect(screen.getByDisplayValue('Water')).toBeInTheDocument();
            expect(screen.getByText('0g / 225g (0% DV)')).toBeInTheDocument();
        });

        it('handles negative macro values gracefully', () => {
            const negativeMacroMeals: Meal[] = [
                {
                    id: 1,
                    name: 'Invalid Meal',
                    carbs: -10,
                    protein: -5,
                    fat: -3,
                },
            ];

            render(
                <MealPlanning {...defaultProps} meals={negativeMacroMeals} />
            );

            // Should display the negative values without crashing
            expect(
                screen.getByDisplayValue('Invalid Meal')
            ).toBeInTheDocument();
        });
    });
});
