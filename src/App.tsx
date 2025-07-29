import { useState } from 'react';
import './App.css';

function App() {
  const [dailyCalories, setDailyCalories] = useState(2000);

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
          
          <div className="macros-preview">
            <h3>Macronutrient Breakdown (example)</h3>
            <div className="macro-item">
              <span>Protein (25%): {Math.round(dailyCalories * 0.25 / 4)}g</span>
              <small>4 kcal/g</small>
            </div>
            <div className="macro-item">
              <span>Carbs (45%): {Math.round(dailyCalories * 0.45 / 4)}g</span>
              <small>4 kcal/g</small>
            </div>
            <div className="macro-item">
              <span>Fat (30%): {Math.round(dailyCalories * 0.30 / 9)}g</span>
              <small>9 kcal/g</small>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
