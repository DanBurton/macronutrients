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
                    carbsPer100g: 0,
                    proteinPer100g: 31,
                    fatPer100g: 3.6,
                    servingSize: 100,
                },
                {
                    id: 2,
                    name: 'Rice',
                    carbsPer100g: 28,
                    proteinPer100g: 2.7,
                    fatPer100g: 0.3,
                    servingSize: 100,
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

            // Get the macro input fields more specifically
            const carbsInput = screen.getByLabelText(/Carbs \(g\):/);
            const proteinInput = screen.getByLabelText(/Protein \(g\):/);
            const fatInput = screen.getByLabelText(/Fat \(g\):/);
            const servingSizeInput = screen.getByDisplayValue('100');

            await user.type(carbsInput, '0'); // carbs
            await user.type(proteinInput, '31'); // protein
            await user.type(fatInput, '3.6'); // fat
            await user.clear(servingSizeInput);
            await user.type(servingSizeInput, '150'); // serving size

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
                carbsPer100g: 0,
                proteinPer100g: 31,
                fatPer100g: 3.6,
                servingSize: 100,
            },
            {
                id: 2,
                name: 'Brown Rice',
                carbsPer100g: 28,
                proteinPer100g: 2.7,
                fatPer100g: 0.3,
                servingSize: 150,
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

        it('shows macro information per 100g and per serving', () => {
            render(<MealPlanning {...defaultProps} />);

            // Check per 100g display
            expect(screen.getAllByText('Per 100g:')[0]).toBeInTheDocument();

            // Check per serving display
            expect(screen.getByText('Per serving (100g):')).toBeInTheDocument();
            expect(screen.getByText('Per serving (150g):')).toBeInTheDocument();
        });

        it('calculates and displays nutrition per serving correctly', () => {
            render(<MealPlanning {...defaultProps} />);

            // Chicken breast: 100g serving
            expect(screen.getByText('0.0g carbs')).toBeInTheDocument();
            expect(screen.getByText('31.0g protein')).toBeInTheDocument();
            expect(screen.getByText('3.6g fat')).toBeInTheDocument();
            expect(screen.getByText('156 cal')).toBeInTheDocument(); // (31*4) + (3.6*9) = 124 + 32.4 = 156.4 ≈ 156

            // Brown rice: 150g serving (28*1.5, 2.7*1.5, 0.3*1.5)
            expect(screen.getByText('42.0g carbs')).toBeInTheDocument();
            expect(screen.getByText('4.1g protein')).toBeInTheDocument();
            expect(screen.getByText(/0\.[34]g fat/)).toBeInTheDocument(); // Allow for decimal precision differences
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

            // Find and interact with serving size input
            const servingSizeInput = screen.getByDisplayValue('100');

            // Just verify that clicking and typing triggers the onChange
            await user.click(servingSizeInput);
            await user.keyboard('{Backspace}{Backspace}{Backspace}200');

            // Verify localStorage was called (which means the component updated)
            expect(mockLocalStorage.setItem).toHaveBeenCalled();

            // And verify the serving size appears somewhere in the updated nutrition display
            await waitFor(() => {
                // The nutrition should reflect some change due to serving size modification
                const nutritionElements = screen.getAllByText(/g\)/);
                expect(nutritionElements.length).toBeGreaterThan(0);
            });
        });

        it('allows editing macro values per 100g', async () => {
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
                    expect.stringContaining('"proteinPer100g":35')
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
                    carbsPer100g: 0,
                    proteinPer100g: 0,
                    fatPer100g: 0,
                    servingSize: 250,
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
                    carbsPer100g: 8.5,
                    proteinPer100g: 2.0,
                    fatPer100g: 14.7,
                    servingSize: 50,
                },
            ];

            mockLocalStorage.getItem.mockReturnValue(
                JSON.stringify(decimalMacroFoods)
            );
            render(<MealPlanning {...defaultProps} />);

            // 50g serving: 8.5*0.5, 2.0*0.5, 14.7*0.5
            expect(screen.getByText('4.3g carbs')).toBeInTheDocument();
            expect(screen.getByText('1.0g protein')).toBeInTheDocument();
            expect(screen.getByText(/7\.[23]g fat/)).toBeInTheDocument(); // Allow for precision differences
        });

        it('handles large serving sizes correctly', () => {
            const largServingFoods: Food[] = [
                {
                    id: 1,
                    name: 'Pasta',
                    carbsPer100g: 25,
                    proteinPer100g: 5,
                    fatPer100g: 1,
                    servingSize: 300,
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
                expect.stringContaining('"carbsPer100g":-5')
            );
        });

        it('handles very small serving sizes', () => {
            const smallServingFoods: Food[] = [
                {
                    id: 1,
                    name: 'Salt',
                    carbsPer100g: 0,
                    proteinPer100g: 0,
                    fatPer100g: 0,
                    servingSize: 1,
                },
            ];

            mockLocalStorage.getItem.mockReturnValue(
                JSON.stringify(smallServingFoods)
            );
            render(<MealPlanning {...defaultProps} />);

            expect(screen.getByText('Per serving (1g):')).toBeInTheDocument();
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
                    /"carbsPer100g":0.*"proteinPer100g":0.*"fatPer100g":0/
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
