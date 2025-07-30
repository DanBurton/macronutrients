import { useState, useEffect } from 'react';
import './App.css';
import MealPlanning, { type Meal } from './MealPlanning';

// https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels
const macroPresets = {
    athletic: { name: 'Athletic', carbs: 0.55, protein: 0.25, fat: 0.2 },
    usda: { name: 'USDA Food Labels', carbs: 0.55, protein: 0.1, fat: 0.35 },
    balanced: { name: 'Balanced', carbs: 0.45, protein: 0.25, fat: 0.3 },
    zone: { name: '40 30 30', carbs: 0.4, protein: 0.3, fat: 0.3 },
    highProtein: { name: 'High Protein', carbs: 0.3, protein: 0.4, fat: 0.3 },
    lowCarb: { name: 'Low Carb', carbs: 0.2, protein: 0.3, fat: 0.5 },
    keto: { name: 'Keto', carbs: 0.05, protein: 0.2, fat: 0.75 },
    custom: { name: 'Custom', carbs: 0.4, protein: 0.3, fat: 0.3 },
} as const;

type PresetKey = keyof typeof macroPresets;

const macroLabels = { carbs: 'Carbs', protein: 'Protein', fat: 'Fat' };
const caloriesPerGram = { carbs: 4, protein: 4, fat: 9 };

interface MacroControlsProps {
    setter: ((value: number) => void) | null;
    currentValue: number;
    upDisabled?: boolean;
}

function MacroControls({
    setter,
    currentValue,
    upDisabled,
}: MacroControlsProps) {
    if (!setter) {
        return (
            <div className="inline-controls">
                <span className="calculated-indicator">⚖️</span>
            </div>
        );
    }

    return (
        <div className="inline-controls">
            <button
                className="inline-button"
                onClick={() => {
                    setter(currentValue + 1);
                }}
                disabled={upDisabled}
            >
                +
            </button>
            <button
                className="inline-button minus"
                onClick={() => {
                    setter(currentValue - 1);
                }}
                disabled={currentValue <= 0}
            >
                −
            </button>
        </div>
    );
}

interface EditGoalsProps {
    dailyCalories: number;
    setDailyCalories: (value: number) => void;
    selectedPreset: PresetKey;
    setSelectedPreset: (preset: PresetKey) => void;
    customCarbs: number;
    setCustomCarbs: (value: number) => void;
    customProtein: number;
    setCustomProtein: (value: number) => void;
    customFat: number;
    currentMacros: { carbs: number; protein: number; fat: number };
}

function EditGoals({
    dailyCalories,
    setDailyCalories,
    selectedPreset,
    setSelectedPreset,
    customCarbs,
    setCustomCarbs,
    customProtein,
    setCustomProtein,
    customFat,
    currentMacros,
}: EditGoalsProps) {
    return (
        <>
            <div className="calorie-input">
                <label htmlFor="calories">Daily Calorie Goal</label>
                <input
                    id="calories"
                    type="number"
                    value={dailyCalories}
                    onChange={(e) => setDailyCalories(Number(e.target.value))}
                />
                <span>kcal</span>
            </div>

            <div className="preset-selector">
                <h3>Macronutrient Distribution</h3>
                <div className="preset-buttons">
                    {Object.entries(macroPresets).map(([key, preset]) => (
                        <button
                            key={key}
                            className={`preset-button ${selectedPreset === key ? 'active' : ''}`}
                            onClick={() => setSelectedPreset(key as PresetKey)}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="macros-preview">
                <h3>Macronutrient Goals</h3>
                {(['carbs', 'protein', 'fat'] as const).map((macro) => {
                    const ratio = currentMacros[macro];
                    const caloriesPerGramValue = caloriesPerGram[macro];
                    const grams = Math.round(
                        (dailyCalories * ratio) / caloriesPerGramValue
                    );
                    const calories = Math.round(dailyCalories * ratio);
                    const percentage = Math.round(ratio * 100);
                    const label = macroLabels[macro];

                    const [setter, currentValue] =
                        macro === 'carbs'
                            ? [setCustomCarbs, customCarbs]
                            : macro === 'protein'
                              ? [setCustomProtein, customProtein]
                              : [null, customFat];

                    return (
                        <div
                            key={macro}
                            className="macro-item"
                            data-macro={macro}
                        >
                            <span className="macro-name">{label}</span>
                            <span className="macro-grams">{grams}g</span>
                            <span className="macro-calories">
                                {calories} kcal
                            </span>
                            <span className="macro-percentage">
                                ({percentage}%)
                            </span>
                            {selectedPreset === 'custom' && (
                                <MacroControls
                                    setter={setter}
                                    currentValue={currentValue}
                                    upDisabled={
                                        customCarbs + customProtein >= 100
                                    }
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}

interface GoalsSummaryProps {
    dailyCalories: number;
    currentMacros: { carbs: number; protein: number; fat: number };
    setIsCollapsed: (collapsed: boolean) => void;
}

function GoalsSummary({
    dailyCalories,
    currentMacros,
    setIsCollapsed,
}: GoalsSummaryProps) {
    const carbsGrams = Math.round(
        (dailyCalories * currentMacros.carbs) / caloriesPerGram.carbs
    );
    const proteinGrams = Math.round(
        (dailyCalories * currentMacros.protein) / caloriesPerGram.protein
    );
    const fatGrams = Math.round(
        (dailyCalories * currentMacros.fat) / caloriesPerGram.fat
    );

    const carbsPercent = Math.round(currentMacros.carbs * 100);
    const proteinPercent = Math.round(currentMacros.protein * 100);
    const fatPercent = Math.round(currentMacros.fat * 100);

    return (
        <div className="goals-summary">
            <div className="summary-single-line">
                <span className="summary-macros-grams">
                    <span className="carbs-remaining">{carbsGrams}g carbs</span>{' '}
                    /{' '}
                    <span className="protein-remaining">
                        {proteinGrams}g protein
                    </span>{' '}
                    / <span className="fat-remaining">{fatGrams}g fat</span>
                </span>
                <span className="summary-calories-and-distribution">
                    <span className="calories-remaining">
                        {dailyCalories} kcal
                    </span>{' '}
                    (<span className="carbs-remaining">{carbsPercent}</span>/
                    <span className="protein-remaining">{proteinPercent}</span>/
                    <span className="fat-remaining">{fatPercent}</span>)
                </span>
                <button
                    className="collapse-button settings-cog"
                    onClick={() => setIsCollapsed(false)}
                >
                    ⚙️
                </button>
            </div>
        </div>
    );
}

function App() {
    const [dailyCalories, setDailyCalories] = useState(() => {
        const savedCalories = localStorage.getItem('dailyCalories');
        return savedCalories ? Number(savedCalories) : 2000;
    });

    const [selectedPreset, setSelectedPreset] = useState<PresetKey>(() => {
        const savedPreset = localStorage.getItem('macroPreset') as PresetKey;
        return savedPreset && savedPreset in macroPresets
            ? savedPreset
            : 'balanced';
    });

    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('isCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    const [customCarbs, setCustomCarbs] = useState(() => {
        const saved = localStorage.getItem('customCarbs');
        return saved ? Number(saved) : 40;
    });

    const [customProtein, setCustomProtein] = useState(() => {
        const saved = localStorage.getItem('customProtein');
        return saved ? Number(saved) : 30;
    });

    const [meals, setMeals] = useState<Meal[]>(() => {
        const saved = localStorage.getItem('meals');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('dailyCalories', dailyCalories.toString());
    }, [dailyCalories]);

    useEffect(() => {
        localStorage.setItem('customCarbs', customCarbs.toString());
    }, [customCarbs]);

    useEffect(() => {
        localStorage.setItem('macroPreset', selectedPreset);
    }, [selectedPreset]);

    useEffect(() => {
        localStorage.setItem('customProtein', customProtein.toString());
    }, [customProtein]);

    useEffect(() => {
        localStorage.setItem('isCollapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    useEffect(() => {
        localStorage.setItem('meals', JSON.stringify(meals));
    }, [meals]);

    const customFat = Math.max(0, 100 - customCarbs - customProtein);

    const currentMacros =
        selectedPreset === 'custom'
            ? {
                  carbs: customCarbs / 100,
                  protein: customProtein / 100,
                  fat: customFat / 100,
              }
            : macroPresets[selectedPreset];

    return (
        <div className="app">
            <main className="app-main">
                <div className="welcome-card">
                    {isCollapsed ? (
                        <GoalsSummary
                            dailyCalories={dailyCalories}
                            currentMacros={currentMacros}
                            setIsCollapsed={setIsCollapsed}
                        />
                    ) : (
                        <>
                            <EditGoals
                                dailyCalories={dailyCalories}
                                setDailyCalories={setDailyCalories}
                                selectedPreset={selectedPreset}
                                setSelectedPreset={setSelectedPreset}
                                customCarbs={customCarbs}
                                setCustomCarbs={setCustomCarbs}
                                customProtein={customProtein}
                                setCustomProtein={setCustomProtein}
                                customFat={customFat}
                                currentMacros={currentMacros}
                            />
                            <button
                                className="collapse-button"
                                onClick={() => setIsCollapsed(true)}
                            >
                                Set Goals
                            </button>
                        </>
                    )}
                </div>

                <div className="welcome-card">
                    <MealPlanning
                        meals={meals}
                        setMeals={setMeals}
                        dailyCalories={dailyCalories}
                        currentMacros={currentMacros}
                    />
                </div>
            </main>
        </div>
    );
}

export default App;
