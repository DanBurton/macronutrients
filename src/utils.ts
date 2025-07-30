import {
    CALORIES_PER_GRAM,
    type MacroRatios,
    type MacroType,
} from './constants';

/**
 * Calculate grams of a macronutrient from calories and ratio
 */
export function calculateMacroGrams(
    dailyCalories: number,
    ratio: number,
    macroType: MacroType
): number {
    return Math.round((dailyCalories * ratio) / CALORIES_PER_GRAM[macroType]);
}

/**
 * Calculate calories from grams of a macronutrient
 */
export function calculateMacroCalories(
    grams: number,
    macroType: MacroType
): number {
    return grams * CALORIES_PER_GRAM[macroType];
}

/**
 * Calculate total calories from macro amounts
 */
export function calculateTotalCalories(macros: MacroRatios): number {
    return (
        calculateMacroCalories(macros.carbs, 'carbs') +
        calculateMacroCalories(macros.protein, 'protein') +
        calculateMacroCalories(macros.fat, 'fat')
    );
}

/**
 * Calculate goal macros in grams from daily calories and ratios
 */
export function calculateGoalMacros(
    dailyCalories: number,
    macroRatios: MacroRatios
): MacroRatios {
    return {
        carbs: calculateMacroGrams(dailyCalories, macroRatios.carbs, 'carbs'),
        protein: calculateMacroGrams(
            dailyCalories,
            macroRatios.protein,
            'protein'
        ),
        fat: calculateMacroGrams(dailyCalories, macroRatios.fat, 'fat'),
    };
}

/**
 * Convert macro ratios to percentages
 */
export function calculateMacroPercentages(
    macroRatios: MacroRatios
): MacroRatios {
    return {
        carbs: Math.round(macroRatios.carbs * 100),
        protein: Math.round(macroRatios.protein * 100),
        fat: Math.round(macroRatios.fat * 100),
    };
}
