import { useState, useEffect } from 'react';
import './App.css';

const macroPresets = {
  balanced: { name: 'Balanced', carbs: 0.45, protein: 0.25, fat: 0.30 },
  highProtein: { name: 'High Protein', carbs: 0.35, protein: 0.35, fat: 0.30 },
  lowCarb: { name: 'Low Carb', carbs: 0.20, protein: 0.30, fat: 0.50 },
  athletic: { name: 'Athletic', carbs: 0.55, protein: 0.25, fat: 0.20 },
} as const;

type PresetKey = keyof typeof macroPresets;

function App() {
  const [dailyCalories, setDailyCalories] = useState(() => {
    const savedCalories = localStorage.getItem('dailyCalories');
    return savedCalories ? Number(savedCalories) : 2000;
  });

  const [selectedPreset, setSelectedPreset] = useState<PresetKey>(() => {
    const savedPreset = localStorage.getItem('macroPreset') as PresetKey;
    return savedPreset && savedPreset in macroPresets ? savedPreset : 'balanced';
  });

  useEffect(() => {
    localStorage.setItem('dailyCalories', dailyCalories.toString());
  }, [dailyCalories]);

  useEffect(() => {
    localStorage.setItem('macroPreset', selectedPreset);
  }, [selectedPreset]);

  const currentMacros = macroPresets[selectedPreset];

  return (
    <div className="app">
      <header className="app-header">
        <h1>Macronutrients Tracker</h1>
        <p>Plan and track your daily nutrition</p>
      </header>
      
      <main className="app-main">
        <div className="welcome-card">
          <h2>Welcome to your nutrition planner!</h2>
          <p>Set your daily calorie goal to get started:</p>
          
          <div className="calorie-input">
            <label htmlFor="calories">Daily Calorie Goal:</label>
            <input
              id="calories"
              type="number"
              value={dailyCalories}
              onChange={(e) => setDailyCalories(Number(e.target.value))}
            />
            <span>kcal</span>
          </div>

          <div className="preset-selector">
            <h3>Macronutrient Distribution:</h3>
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
            <h3>Macronutrient Breakdown</h3>
            <div className="macro-item">
              <span className="macro-name">Carbs:</span>
              <span className="macro-grams">{Math.round(dailyCalories * currentMacros.carbs / 4)}g</span>
              <span className="macro-multiply">*</span>
              <span className="macro-rate">4 kcal/g</span>
              <span className="macro-equals">=</span>
              <span className="macro-calories">{Math.round(dailyCalories * currentMacros.carbs)} kcal</span>
              <span className="macro-percentage">({Math.round(currentMacros.carbs * 100)}%)</span>
            </div>
            <div className="macro-item">
              <span className="macro-name">Protein:</span>
              <span className="macro-grams">{Math.round(dailyCalories * currentMacros.protein / 4)}g</span>
              <span className="macro-multiply">*</span>
              <span className="macro-rate">4 kcal/g</span>
              <span className="macro-equals">=</span>
              <span className="macro-calories">{Math.round(dailyCalories * currentMacros.protein)} kcal</span>
              <span className="macro-percentage">({Math.round(currentMacros.protein * 100)}%)</span>
            </div>
            <div className="macro-item">
              <span className="macro-name">Fat:</span>
              <span className="macro-grams">{Math.round(dailyCalories * currentMacros.fat / 9)}g</span>
              <span className="macro-multiply">*</span>
              <span className="macro-rate">9 kcal/g</span>
              <span className="macro-equals">=</span>
              <span className="macro-calories">{Math.round(dailyCalories * currentMacros.fat)} kcal</span>
              <span className="macro-percentage">({Math.round(currentMacros.fat * 100)}%)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
