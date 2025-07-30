import { describe, it, expect } from 'vitest';
import {
    CALORIES_PER_GRAM,
    MACRO_LABELS,
    MACRO_PRESETS,
} from '../src/constants';

describe('Constants', () => {
    describe('CALORIES_PER_GRAM', () => {
        it('has correct calorie values per gram', () => {
            expect(CALORIES_PER_GRAM.carbs).toBe(4);
            expect(CALORIES_PER_GRAM.protein).toBe(4);
            expect(CALORIES_PER_GRAM.fat).toBe(9);
        });
    });

    describe('MACRO_LABELS', () => {
        it('has correct macro labels', () => {
            expect(MACRO_LABELS.carbs).toBe('Carbs');
            expect(MACRO_LABELS.protein).toBe('Protein');
            expect(MACRO_LABELS.fat).toBe('Fat');
        });
    });

    describe('MACRO_PRESETS', () => {
        it('has all expected presets', () => {
            const presetKeys = Object.keys(MACRO_PRESETS);
            expect(presetKeys).toContain('athletic');
            expect(presetKeys).toContain('usda');
            expect(presetKeys).toContain('balanced');
            expect(presetKeys).toContain('zone');
            expect(presetKeys).toContain('highProtein');
            expect(presetKeys).toContain('lowCarb');
            expect(presetKeys).toContain('keto');
            expect(presetKeys).toContain('custom');
        });

        it('has balanced preset with correct ratios', () => {
            const balanced = MACRO_PRESETS.balanced;
            expect(balanced.name).toBe('Balanced');
            expect(balanced.carbs).toBe(0.45);
            expect(balanced.protein).toBe(0.25);
            expect(balanced.fat).toBe(0.3);
        });

        it('has keto preset with correct ratios', () => {
            const keto = MACRO_PRESETS.keto;
            expect(keto.name).toBe('Keto');
            expect(keto.carbs).toBe(0.05);
            expect(keto.protein).toBe(0.2);
            expect(keto.fat).toBe(0.75);
        });

        it('has zone preset with correct ratios', () => {
            const zone = MACRO_PRESETS.zone;
            expect(zone.name).toBe('40 30 30');
            expect(zone.carbs).toBe(0.4);
            expect(zone.protein).toBe(0.3);
            expect(zone.fat).toBe(0.3);
        });

        it('all presets have ratios that sum to 1.0', () => {
            Object.entries(MACRO_PRESETS).forEach(([key, preset]) => {
                if (key !== 'custom') {
                    // Custom ratios are user-defined
                    const sum = preset.carbs + preset.protein + preset.fat;
                    expect(sum).toBeCloseTo(1.0, 5); // Allow for small floating point errors
                }
            });
        });

        it('all presets have positive ratios', () => {
            Object.values(MACRO_PRESETS).forEach((preset) => {
                expect(preset.carbs).toBeGreaterThanOrEqual(0);
                expect(preset.protein).toBeGreaterThanOrEqual(0);
                expect(preset.fat).toBeGreaterThanOrEqual(0);
            });
        });
    });
});
