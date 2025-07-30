// Nutritional constants
export const CALORIES_PER_GRAM = {
    carbs: 4,
    protein: 4,
    fat: 9,
} as const;

export const MACRO_LABELS = {
    carbs: 'Carbs',
    protein: 'Protein',
    fat: 'Fat',
} as const;

// FDA guidelines: https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels
export const MACRO_PRESETS = {
    athletic: { name: 'Athletic', carbs: 0.55, protein: 0.25, fat: 0.2 },
    usda: { name: 'USDA Food Labels', carbs: 0.55, protein: 0.1, fat: 0.35 },
    balanced: { name: 'Balanced', carbs: 0.45, protein: 0.25, fat: 0.3 },
    zone: { name: '40 30 30', carbs: 0.4, protein: 0.3, fat: 0.3 },
    highProtein: { name: 'High Protein', carbs: 0.3, protein: 0.4, fat: 0.3 },
    lowCarb: { name: 'Low Carb', carbs: 0.2, protein: 0.3, fat: 0.5 },
    keto: { name: 'Keto', carbs: 0.05, protein: 0.2, fat: 0.75 },
    custom: { name: 'Custom', carbs: 0.4, protein: 0.3, fat: 0.3 },
} as const;

export type PresetKey = keyof typeof MACRO_PRESETS;
export type MacroType = 'carbs' | 'protein' | 'fat';

export interface MacroRatios {
    carbs: number;
    protein: number;
    fat: number;
}
