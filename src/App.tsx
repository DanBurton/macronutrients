import './App.css';
import MealPlanning, { type Meal } from './MealPlanning';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
    MACRO_PRESETS,
    MACRO_LABELS,
    CALORIES_PER_GRAM,
    type PresetKey,
    type MacroRatios,
} from './constants';

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
    currentMacros: MacroRatios;
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
                    {Object.entries(MACRO_PRESETS).map(([key, preset]) => (
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
                    const caloriesPerGramValue = CALORIES_PER_GRAM[macro];
                    const grams = Math.round(
                        (dailyCalories * ratio) / caloriesPerGramValue
                    );
                    const calories = Math.round(dailyCalories * ratio);
                    const percentage = Math.round(ratio * 100);
                    const label = MACRO_LABELS[macro];

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
    currentMacros: MacroRatios;
    setIsCollapsed: (collapsed: boolean) => void;
}

function GoalsSummary({
    dailyCalories,
    currentMacros,
    setIsCollapsed,
}: GoalsSummaryProps) {
    const carbsGrams = Math.round(
        (dailyCalories * currentMacros.carbs) / CALORIES_PER_GRAM.carbs
    );
    const proteinGrams = Math.round(
        (dailyCalories * currentMacros.protein) / CALORIES_PER_GRAM.protein
    );
    const fatGrams = Math.round(
        (dailyCalories * currentMacros.fat) / CALORIES_PER_GRAM.fat
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
    const [dailyCalories, setDailyCalories] = useLocalStorage(
        'dailyCalories',
        2000
    );
    const [selectedPreset, setSelectedPreset] = useLocalStorage<PresetKey>(
        'macroPreset',
        'balanced'
    );
    const [isCollapsed, setIsCollapsed] = useLocalStorage('isCollapsed', false);
    const [customCarbs, setCustomCarbs] = useLocalStorage('customCarbs', 40);
    const [customProtein, setCustomProtein] = useLocalStorage(
        'customProtein',
        30
    );
    const [meals, setMeals] = useLocalStorage<Meal[]>('meals', []);

    // Validate preset exists in case localStorage has an invalid value
    const validatedPreset =
        selectedPreset in MACRO_PRESETS ? selectedPreset : 'balanced';
    if (validatedPreset !== selectedPreset) {
        setSelectedPreset(validatedPreset);
    }

    const customFat = Math.max(0, 100 - customCarbs - customProtein);

    const currentMacros: MacroRatios =
        validatedPreset === 'custom'
            ? {
                  carbs: customCarbs / 100,
                  protein: customProtein / 100,
                  fat: customFat / 100,
              }
            : MACRO_PRESETS[validatedPreset];

    return (
        <div className="app">
            <main className="app-main">
                <div className="card">
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

                <div className="card">
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
