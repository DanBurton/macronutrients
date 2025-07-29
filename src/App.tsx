import { useState, useEffect } from 'react';
import './App.css';

// https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels
const macroPresets = {
  athletic: { name: 'Athletic', carbs: 0.55, protein: 0.25, fat: 0.20 },
  usda: { name: 'USDA Food Labels', carbs: 0.55, protein: 0.10, fat: 0.35 },
  balanced: { name: 'Balanced', carbs: 0.45, protein: 0.25, fat: 0.30 },
  zone: { name: '40 30 30', carbs: 0.40, protein: 0.30, fat: 0.30 },
  highProtein: { name: 'High Protein', carbs: 0.30, protein: 0.40, fat: 0.30 },
  lowCarb: { name: 'Low Carb', carbs: 0.20, protein: 0.30, fat: 0.50 },
  keto: { name: 'Keto', carbs: 0.05, protein: 0.20, fat: 0.75 },
  custom: { name: 'Custom', carbs: 0.40, protein: 0.30, fat: 0.30 },
} as const;

type PresetKey = keyof typeof macroPresets;

const macroLabels = { carbs: 'Carbs', protein: 'Protein', fat: 'Fat' };
const caloriesPerGram = { carbs: 4, protein: 4, fat: 9 };

interface MacroControlsProps {
  setter: ((value: number) => void) | null;
  currentValue: number;
  upDisabled?: boolean;
}

function MacroControls({ setter, currentValue, upDisabled }: MacroControlsProps) {
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
        onClick={() => { setter(currentValue + 1); }}
        disabled={upDisabled}
      >+</button>
      <button
        className="inline-button minus"
        onClick={() => { setter(currentValue - 1); }}
        disabled={currentValue <= 0}
      >−</button>
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
    return savedPreset && savedPreset in macroPresets ? savedPreset : 'balanced';
  });

  const [customCarbs, setCustomCarbs] = useState(() => {
    const saved = localStorage.getItem('customCarbs');
    return saved ? Number(saved) : 40;
  });

  const [customProtein, setCustomProtein] = useState(() => {
    const saved = localStorage.getItem('customProtein');
    return saved ? Number(saved) : 30;
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

  const customFat = Math.max(0, 100 - customCarbs - customProtein);

  const currentMacros = selectedPreset === 'custom'
    ? { carbs: customCarbs / 100, protein: customProtein / 100, fat: customFat / 100 }
    : macroPresets[selectedPreset];

  return (
    <div className="app">
      <main className="app-main">
        <div className="welcome-card">
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
            {(['carbs', 'protein', 'fat'] as const).map(macro => {
              const ratio = currentMacros[macro];
              const caloriesPerGramValue = caloriesPerGram[macro];
              const grams = Math.round(dailyCalories * ratio / caloriesPerGramValue);
              const calories = Math.round(dailyCalories * ratio);
              const percentage = Math.round(ratio * 100);
              const label = macroLabels[macro];

              const currentValue = macro === 'carbs' ? customCarbs : macro === 'protein' ? customProtein : customFat;

              return (
                <div key={macro} className="macro-item">
                  <span className="macro-name">{label}</span>
                  <span className="macro-grams">{grams}g</span>
                  <span className="macro-multiply">*</span>
                  <span className="macro-conversion-rate">{caloriesPerGramValue} kcal/g</span>
                  <span className="macro-equals">=</span>
                  <span className="macro-calories">{calories} kcal</span>
                  <span className="macro-percentage">
                    ({percentage}%)
                    {selectedPreset === 'custom' && (
                      <MacroControls
                        setter={macro === 'carbs' ? setCustomCarbs : macro === 'protein' ? setCustomProtein : null}
                        currentValue={currentValue}
                        upDisabled={customCarbs + customProtein >= 100}
                      />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
