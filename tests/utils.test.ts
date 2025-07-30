import { describe, it, expect } from 'vitest';
import {
    calculateMacroGrams,
    calculateMacroCalories,
    calculateTotalCalories,
    calculateGoalMacros,
    calculateMacroPercentages,
} from '../src/utils';
import type { MacroRatios } from '../src/constants';

describe('Macro Calculation Utils', () => {
    describe('calculateMacroGrams', () => {
        it('calculates carb grams correctly', () => {
            // 2000 calories * 0.5 ratio = 1000 calories / 4 calories per gram = 250g
            expect(calculateMacroGrams(2000, 0.5, 'carbs')).toBe(250);
        });

        it('calculates protein grams correctly', () => {
            // 2000 calories * 0.25 ratio = 500 calories / 4 calories per gram = 125g
            expect(calculateMacroGrams(2000, 0.25, 'protein')).toBe(125);
        });

        it('calculates fat grams correctly', () => {
            // 2000 calories * 0.25 ratio = 500 calories / 9 calories per gram = 56g (rounded)
            expect(calculateMacroGrams(2000, 0.25, 'fat')).toBe(56);
        });

        it('handles zero calories', () => {
            expect(calculateMacroGrams(0, 0.5, 'carbs')).toBe(0);
        });

        it('handles zero ratio', () => {
            expect(calculateMacroGrams(2000, 0, 'carbs')).toBe(0);
        });
    });

    describe('calculateMacroCalories', () => {
        it('calculates carb calories correctly', () => {
            expect(calculateMacroCalories(100, 'carbs')).toBe(400);
        });

        it('calculates protein calories correctly', () => {
            expect(calculateMacroCalories(100, 'protein')).toBe(400);
        });

        it('calculates fat calories correctly', () => {
            expect(calculateMacroCalories(100, 'fat')).toBe(900);
        });

        it('handles zero grams', () => {
            expect(calculateMacroCalories(0, 'carbs')).toBe(0);
        });
    });

    describe('calculateTotalCalories', () => {
        it('calculates total calories from macro amounts', () => {
            const macros: MacroRatios = {
                carbs: 250, // 250 * 4 = 1000 calories
                protein: 125, // 125 * 4 = 500 calories
                fat: 56, // 56 * 9 = 504 calories
            };
            expect(calculateTotalCalories(macros)).toBe(2004);
        });

        it('handles zero macros', () => {
            const macros: MacroRatios = {
                carbs: 0,
                protein: 0,
                fat: 0,
            };
            expect(calculateTotalCalories(macros)).toBe(0);
        });
    });

    describe('calculateGoalMacros', () => {
        it('calculates balanced macro goals correctly', () => {
            const macroRatios: MacroRatios = {
                carbs: 0.45,
                protein: 0.25,
                fat: 0.3,
            };
            const result = calculateGoalMacros(2000, macroRatios);

            expect(result.carbs).toBe(225); // 2000 * 0.45 / 4 = 225
            expect(result.protein).toBe(125); // 2000 * 0.25 / 4 = 125
            expect(result.fat).toBe(67); // 2000 * 0.3 / 9 = 66.67 rounded to 67
        });

        it('calculates keto macro goals correctly', () => {
            const macroRatios: MacroRatios = {
                carbs: 0.05,
                protein: 0.2,
                fat: 0.75,
            };
            const result = calculateGoalMacros(2000, macroRatios);

            expect(result.carbs).toBe(25); // 2000 * 0.05 / 4 = 25
            expect(result.protein).toBe(100); // 2000 * 0.2 / 4 = 100
            expect(result.fat).toBe(167); // 2000 * 0.75 / 9 = 166.67 rounded to 167
        });
    });

    describe('calculateMacroPercentages', () => {
        it('converts decimal ratios to percentages', () => {
            const macroRatios: MacroRatios = {
                carbs: 0.45,
                protein: 0.25,
                fat: 0.3,
            };
            const result = calculateMacroPercentages(macroRatios);

            expect(result.carbs).toBe(45);
            expect(result.protein).toBe(25);
            expect(result.fat).toBe(30);
        });

        it('rounds percentages correctly', () => {
            const macroRatios: MacroRatios = {
                carbs: 0.456,
                protein: 0.244,
                fat: 0.3,
            };
            const result = calculateMacroPercentages(macroRatios);

            expect(result.carbs).toBe(46);
            expect(result.protein).toBe(24);
            expect(result.fat).toBe(30);
        });
    });
});
