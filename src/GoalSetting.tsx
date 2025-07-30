import {
    type PresetKey,
    type MacroRatios,
    MACRO_PRESETS,
    MACRO_LABELS,
    CALORIES_PER_GRAM,
} from './constants';
import { calculateGoalMacros, calculateMacroPercentages } from './utils';
import './GoalSetting.css';
import './shared.css';

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
    const goalMacros = calculateGoalMacros(dailyCalories, currentMacros);
    const macroPercentages = calculateMacroPercentages(currentMacros);

    return (
        <div className="goals-summary">
            <div className="summary-single-line">
                <span className="summary-macros-grams">
                    <span className="carbs-text">
                        {goalMacros.carbs}g carbs
                    </span>{' '}
                    /{' '}
                    <span className="protein-text">
                        {goalMacros.protein}g protein
                    </span>{' '}
                    / <span className="fat-text">{goalMacros.fat}g fat</span>
                </span>
                <span className="summary-calories-and-distribution">
                    <span className="calories-text">{dailyCalories} kcal</span>{' '}
                    (
                    <span className="carbs-text">{macroPercentages.carbs}</span>
                    /
                    <span className="protein-text">
                        {macroPercentages.protein}
                    </span>
                    /<span className="fat-text">{macroPercentages.fat}</span>)
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

interface GoalSettingProps {
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
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

function GoalSetting({
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
    isCollapsed,
    setIsCollapsed,
}: GoalSettingProps) {
    return (
        <>
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
        </>
    );
}

export default GoalSetting;
