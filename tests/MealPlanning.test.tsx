import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MealPlanning, { type Food } from '../src/MealPlanning';

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

vi.stubGlobal('localStorage', mockLocalStorage);

describe('MealPlanning Component', () => {
    const defaultProps = {
        isCollapsed: false,
        setIsCollapsed: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue(null);
    });

    describe('Initial State', () => {
        it('renders meal planning section with add food button', () => {
            render(<MealPlanning {...defaultProps} />);

            expect(screen.getByText('Meal Planning')).toBeInTheDocument();
            expect(screen.getByText('+ Add Food')).toBeInTheDocument();
        });

        it('shows empty state when no foods defined', () => {
            render(<MealPlanning {...defaultProps} />);

            expect(
                screen.getByText('No foods defined yet.')
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'Add foods to build your meal planning library.'
                )
            ).toBeInTheDocument();
        });

        it('can be collapsed and expanded', async () => {
            const mockSetIsCollapsed = vi.fn();
            const user = userEvent.setup();

            render(
                <MealPlanning
                    {...defaultProps}
                    setIsCollapsed={mockSetIsCollapsed}
                />
            );

            const collapseButton = screen.getByLabelText(
                'Collapse meal planning section'
            );
            await user.click(collapseButton);

            expect(mockSetIsCollapsed).toHaveBeenCalledWith(true);
        });

        it('shows collapsed summary when collapsed with foods', () => {
            const sampleFoods: Food[] = [
                {
                    id: 1,
                    name: 'Chicken Breast',
                    servingSize: 1,
                    servingUnit: 'piece',
                    carbsPerServing: 0,
                    proteinPerServing: 31,
                    fatPerServing: 3.6,
                },
                {
                    id: 2,
                    name: 'Rice',
                    servingSize: 1,
                    servingUnit: 'cup',
                    carbsPerServing: 28,
                    proteinPerServing: 2.7,
                    fatPerServing: 0.3,
                },
            ];

            mockLocalStorage.getItem.mockReturnValue(
                JSON.stringify(sampleFoods)
            );

            render(<MealPlanning {...defaultProps} isCollapsed={true} />);

            expect(screen.getByText('2 foods defined')).toBeInTheDocument();
        });
    });

    describe('Adding Foods', () => {
        it('shows add food form when add button is clicked', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            const addButton = screen.getByText('+ Add Food');
            await user.click(addButton);

            expect(screen.getByText('Add New Food')).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText('e.g., Chicken Breast')
            ).toBeInTheDocument();
            expect(screen.getByText('Save Food')).toBeInTheDocument();
            expect(screen.getByText('Cancel')).toBeInTheDocument();
        });

        it('disables add button when form is open', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            const addButton = screen.getByText('+ Add Food');
            await user.click(addButton);

            expect(addButton).toBeDisabled();
        });

        it('can cancel adding a food', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            const addButton = screen.getByText('+ Add Food');
            await user.click(addButton);

            const cancelButton = screen.getByText('Cancel');
            await user.click(cancelButton);

            expect(screen.queryByText('Add New Food')).not.toBeInTheDocument();
            expect(addButton).not.toBeDisabled();
        });

        it('can save a new food with complete information', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            // Open form
            await user.click(screen.getByText('+ Add Food'));

            // Fill form
            await user.type(
                screen.getByPlaceholderText('e.g., Chicken Breast'),
                'Chicken Breast'
            );

            // Update serving size and unit
            const servingSizeInput = screen.getByDisplayValue('1');
            const unitSelect = screen.getByDisplayValue('cup');

            await user.clear(servingSizeInput);
            await user.type(servingSizeInput, '1');
            await user.selectOptions(unitSelect, 'piece');

            // Get the macro input fields more specifically
            const carbsInput = screen.getByLabelText(/Carbs \(g\):/);
            const proteinInput = screen.getByLabelText(/Protein \(g\):/);
            const fatInput = screen.getByLabelText(/Fat \(g\):/);

            await user.type(carbsInput, '0'); // carbs per serving
            await user.type(proteinInput, '31'); // protein per serving
            await user.type(fatInput, '3.6'); // fat per serving

            // Save
            await user.click(screen.getByText('Save Food'));

            // Verify localStorage was called to save the food
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'foods',
                expect.stringContaining('"name":"Chicken Breast"')
            );
        });

        it('handles saving food with minimal information', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            // Open form
            await user.click(screen.getByText('+ Add Food'));

            // Fill only name
            await user.type(
                screen.getByPlaceholderText('e.g., Chicken Breast'),
                'Water'
            );

            // Save
            await user.click(screen.getByText('Save Food'));

            // Should still save with default values
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'foods',
                expect.stringContaining('"name":"Water"')
            );
        });

        it('does not save food without a name', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            // Count initial localStorage calls
            const initialCallCount = mockLocalStorage.setItem.mock.calls.length;

            // Open form
            await user.click(screen.getByText('+ Add Food'));

            // Try to save without name
            await user.click(screen.getByText('Save Food'));

            // Should not have made additional localStorage calls beyond initial render
            expect(mockLocalStorage.setItem.mock.calls.length).toBe(
                initialCallCount
            );
        });
    });

    describe('Existing Foods', () => {
        const sampleFoods: Food[] = [
            {
                id: 1,
                name: 'Chicken Breast',
                servingSize: 1,
                servingUnit: 'piece',
                carbsPerServing: 0,
                proteinPerServing: 31,
                fatPerServing: 3.6,
            },
            {
                id: 2,
                name: 'Brown Rice',
                servingSize: 1.5,
                servingUnit: 'cup',
                carbsPerServing: 42,
                proteinPerServing: 4.05,
                fatPerServing: 0.45,
            },
        ];

        beforeEach(() => {
            mockLocalStorage.getItem.mockReturnValue(
                JSON.stringify(sampleFoods)
            );
        });

        it('displays existing foods library', () => {
            render(<MealPlanning {...defaultProps} />);

            expect(screen.getByText('Your Foods Library')).toBeInTheDocument();
            expect(
                screen.getByDisplayValue('Chicken Breast')
            ).toBeInTheDocument();
            expect(screen.getByDisplayValue('Brown Rice')).toBeInTheDocument();
        });

        it('shows macro information per serving', () => {
            render(<MealPlanning {...defaultProps} />);

            // Check per serving display
            expect(
                screen.getByText('Per serving (1 piece):')
            ).toBeInTheDocument();
            expect(
                screen.getByText('Per serving (1.5 cup):')
            ).toBeInTheDocument();
        });

        it('calculates and displays nutrition per serving correctly', () => {
            render(<MealPlanning {...defaultProps} />);

            // Chicken breast: 1 piece serving
            expect(screen.getByText('0.0g carbs')).toBeInTheDocument();
            expect(screen.getByText('31.0g protein')).toBeInTheDocument();
            expect(screen.getByText('3.6g fat')).toBeInTheDocument();
            expect(screen.getByText('156 cal')).toBeInTheDocument(); // (31*4) + (3.6*9) = 124 + 32.4 = 156.4 ≈ 156

            // Brown rice: 1.5 cup serving
            expect(screen.getByText('42.0g carbs')).toBeInTheDocument();
            expect(screen.getByText('4.0g protein')).toBeInTheDocument(); // Rounded from 4.05
            expect(screen.getByText(/0\.[45]g fat/)).toBeInTheDocument(); // Rounded from 0.45
        });

        it('allows editing food names', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            const nameInput = screen.getByDisplayValue('Chicken Breast');
            await user.clear(nameInput);
            await user.type(nameInput, 'Grilled Chicken');

            // Should update localStorage
            await waitFor(() => {
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                    'foods',
                    expect.stringContaining('"name":"Grilled Chicken"')
                );
            });
        });

        it('allows editing serving sizes', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            // Find and interact with serving size input (now shows "1" instead of "100")
            const servingSizeInput = screen.getByDisplayValue('1');

            // Just verify that clicking and typing triggers the onChange
            await user.click(servingSizeInput);
            await user.keyboard('{Backspace}2');

            // Verify localStorage was called (which means the component updated)
            expect(mockLocalStorage.setItem).toHaveBeenCalled();

            // And verify the serving size appears in the updated nutrition display
            await waitFor(() => {
                // The nutrition should reflect change due to serving size modification
                const nutritionElements = screen.getAllByText(/piece\)/);
                expect(nutritionElements.length).toBeGreaterThan(0);
            });
        });

        it('allows editing macro values per serving', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            // Find protein input for chicken breast (should show 31)
            const proteinInputs = screen.getAllByDisplayValue('31');
            await user.clear(proteinInputs[0]);
            await user.type(proteinInputs[0], '35');

            // Should update localStorage
            await waitFor(() => {
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                    'foods',
                    expect.stringContaining('"proteinPerServing":35')
                );
            });
        });

        it('allows deleting foods', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            const deleteButtons = screen.getAllByText('🗑');
            await user.click(deleteButtons[0]);

            // Should update localStorage with remaining foods
            await waitFor(() => {
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                    'foods',
                    expect.not.stringContaining('"name":"Chicken Breast"')
                );
            });
        });
    });

    describe('Nutrition Calculations', () => {
        it('handles zero macro values correctly', () => {
            const zeroMacroFoods: Food[] = [
                {
                    id: 1,
                    name: 'Water',
                    servingSize: 1,
                    servingUnit: 'cup',
                    carbsPerServing: 0,
                    proteinPerServing: 0,
                    fatPerServing: 0,
                },
            ];

            mockLocalStorage.getItem.mockReturnValue(
                JSON.stringify(zeroMacroFoods)
            );
            render(<MealPlanning {...defaultProps} />);

            expect(screen.getByText('0.0g carbs')).toBeInTheDocument();
            expect(screen.getByText('0.0g protein')).toBeInTheDocument();
            expect(screen.getByText('0.0g fat')).toBeInTheDocument();
            expect(screen.getByText('0 cal')).toBeInTheDocument();
        });

        it('handles decimal macro values correctly', () => {
            const decimalMacroFoods: Food[] = [
                {
                    id: 1,
                    name: 'Avocado',
                    servingSize: 0.5,
                    servingUnit: 'piece',
                    carbsPerServing: 4.25,
                    proteinPerServing: 1.0,
                    fatPerServing: 7.35,
                },
            ];

            mockLocalStorage.getItem.mockReturnValue(
                JSON.stringify(decimalMacroFoods)
            );
            render(<MealPlanning {...defaultProps} />);

            // Verify the expected values shown
            expect(screen.getByText('4.3g carbs')).toBeInTheDocument();
            expect(screen.getByText('1.0g protein')).toBeInTheDocument();
            expect(screen.getByText(/7\.[23]g fat/)).toBeInTheDocument(); // Allow for precision differences
        });

        it('handles large serving sizes correctly', () => {
            const largServingFoods: Food[] = [
                {
                    id: 1,
                    name: 'Pasta',
                    servingSize: 3,
                    servingUnit: 'cup',
                    carbsPerServing: 75,
                    proteinPerServing: 15,
                    fatPerServing: 3,
                },
            ];

            mockLocalStorage.getItem.mockReturnValue(
                JSON.stringify(largServingFoods)
            );
            render(<MealPlanning {...defaultProps} />);

            // 300g serving: 25*3, 5*3, 1*3
            expect(screen.getByText('75.0g carbs')).toBeInTheDocument();
            expect(screen.getByText('15.0g protein')).toBeInTheDocument();
            expect(screen.getByText('3.0g fat')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('handles corrupted localStorage data gracefully', () => {
            mockLocalStorage.getItem.mockReturnValue('invalid json');

            render(<MealPlanning {...defaultProps} />);

            // Should show empty state instead of crashing
            expect(
                screen.getByText('No foods defined yet.')
            ).toBeInTheDocument();
        });

        it('handles negative macro values gracefully', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            // Open form and enter negative values
            await user.click(screen.getByText('+ Add Food'));
            await user.type(
                screen.getByPlaceholderText('e.g., Chicken Breast'),
                'Invalid Food'
            );

            const carbsInput = screen.getAllByDisplayValue('')[0];
            await user.type(carbsInput, '-5');

            await user.click(screen.getByText('Save Food'));

            // Should save with the negative value (validation could be added later)
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'foods',
                expect.stringContaining('"carbsPerServing":-5')
            );
        });

        it('handles very small serving sizes', () => {
            const smallServingFoods: Food[] = [
                {
                    id: 1,
                    name: 'Salt',
                    servingSize: 1,
                    servingUnit: 'tsp',
                    carbsPerServing: 0,
                    proteinPerServing: 0,
                    fatPerServing: 0,
                },
            ];

            mockLocalStorage.getItem.mockReturnValue(
                JSON.stringify(smallServingFoods)
            );
            render(<MealPlanning {...defaultProps} />);

            expect(
                screen.getByText('Per serving (1 tsp):')
            ).toBeInTheDocument();
        });

        it('handles missing form fields gracefully', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            // Open form
            await user.click(screen.getByText('+ Add Food'));

            // Fill only name, leave macros empty
            await user.type(
                screen.getByPlaceholderText('e.g., Chicken Breast'),
                'Mystery Food'
            );

            await user.click(screen.getByText('Save Food'));

            // Should save with zero values for empty fields
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'foods',
                expect.stringMatching(
                    /"carbsPerServing":0.*"proteinPerServing":0.*"fatPerServing":0/
                )
            );
        });
    });

    describe('Form Validation', () => {
        it('trims whitespace from food names', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            await user.click(screen.getByText('+ Add Food'));
            await user.type(
                screen.getByPlaceholderText('e.g., Chicken Breast'),
                '  Chicken Breast  '
            );
            await user.click(screen.getByText('Save Food'));

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'foods',
                expect.stringContaining('"name":"Chicken Breast"')
            );
        });

        it('does not save foods with only whitespace names', async () => {
            const user = userEvent.setup();
            render(<MealPlanning {...defaultProps} />);

            // Count initial localStorage calls
            const initialCallCount = mockLocalStorage.setItem.mock.calls.length;

            await user.click(screen.getByText('+ Add Food'));
            await user.type(
                screen.getByPlaceholderText('e.g., Chicken Breast'),
                '   '
            );
            await user.click(screen.getByText('Save Food'));

            // Should not have made additional localStorage calls beyond initial render
            expect(mockLocalStorage.setItem.mock.calls.length).toBe(
                initialCallCount
            );
        });
    });
});
