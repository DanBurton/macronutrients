import './App.css';
import DailyMacros, { type Meal } from './DailyMacros';
import GoalSetting from './GoalSetting';
import MealPlanning from './MealPlanning';
import { useLocalStorage } from './hooks/useLocalStorage';
import { MACRO_PRESETS, type PresetKey, type MacroRatios } from './constants';

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
    const [isMealPlanningCollapsed, setIsMealPlanningCollapsed] =
        useLocalStorage('isMealPlanningCollapsed', false);
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
                    <GoalSetting
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
                        isCollapsed={isCollapsed}
                        setIsCollapsed={setIsCollapsed}
                    />
                </div>

                <div className="card">
                    <MealPlanning
                        isCollapsed={isMealPlanningCollapsed}
                        setIsCollapsed={setIsMealPlanningCollapsed}
                    />
                </div>

                <div className="card">
                    <DailyMacros
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
