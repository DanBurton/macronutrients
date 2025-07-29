interface Meal {
    id: number;
    name: string;
    carbs: number;
    protein: number;
    fat: number;
}

interface MealPlanningProps {
    meals: Meal[];
    setMeals: (meals: Meal[]) => void;
    dailyCalories: number;
    currentMacros: { carbs: number; protein: number; fat: number };
}

function MealPlanning({ meals, setMeals, dailyCalories, currentMacros }: MealPlanningProps) {
    const addMeal = () => {
        const newMeal: Meal = {
            id: Date.now(),
            name: `Meal ${meals.length + 1}`,
            carbs: 0,
            protein: 0,
            fat: 0
        };
        setMeals([...meals, newMeal]);
    };

    const updateMeal = (id: number, field: keyof Omit<Meal, 'id'>, value: string | number) => {
        setMeals(meals.map(meal =>
            meal.id === id ? { ...meal, [field]: value } : meal
        ));
    };

    const deleteMeal = (id: number) => {
        setMeals(meals.filter(meal => meal.id !== id));
    };

    const totalMacros = meals.reduce(
        (total, meal) => ({
            carbs: total.carbs + meal.carbs,
            protein: total.protein + meal.protein,
            fat: total.fat + meal.fat
        }),
        { carbs: 0, protein: 0, fat: 0 }
    );

    const totalCalories = totalMacros.carbs * 4 + totalMacros.protein * 4 + totalMacros.fat * 9;
    const remainingCalories = dailyCalories - totalCalories;

    const goalCarbs = Math.round(dailyCalories * currentMacros.carbs / 4);
    const goalProtein = Math.round(dailyCalories * currentMacros.protein / 4);
    const goalFat = Math.round(dailyCalories * currentMacros.fat / 9);

    return (
        <div className="meal-planning">
            <div className="meal-planning-header">
                <h3>Meal Planning</h3>
                <button className="add-meal-button" onClick={addMeal}>
                    + Add Meal
                </button>
            </div>

            {meals.length > 0 && (
                <div className="meals-list">
                    {meals.map(meal => (
                        <div key={meal.id} className="meal-row">
                            <input
                                type="text"
                                value={meal.name}
                                onChange={(e) => updateMeal(meal.id, 'name', e.target.value)}
                                className="meal-name-input"
                                placeholder="Meal name"
                            />
                            <div className="meal-macros">
                                <div className="macro-input">
                                    <label>Carbs</label>
                                    <input
                                        type="number"
                                        value={meal.carbs || ''}
                                        onChange={(e) => updateMeal(meal.id, 'carbs', Number(e.target.value) || 0)}
                                        className="macro-value-input"
                                        placeholder="0"
                                    />
                                    <span>g</span>
                                </div>
                                <div className="macro-input">
                                    <label>Protein</label>
                                    <input
                                        type="number"
                                        value={meal.protein || ''}
                                        onChange={(e) => updateMeal(meal.id, 'protein', Number(e.target.value) || 0)}
                                        className="macro-value-input"
                                        placeholder="0"
                                    />
                                    <span>g</span>
                                </div>
                                <div className="macro-input">
                                    <label>Fat</label>
                                    <input
                                        type="number"
                                        value={meal.fat || ''}
                                        onChange={(e) => updateMeal(meal.id, 'fat', Number(e.target.value) || 0)}
                                        className="macro-value-input"
                                        placeholder="0"
                                    />
                                    <span>g</span>
                                </div>
                            </div>
                            <button
                                className="delete-meal-button"
                                onClick={() => deleteMeal(meal.id)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {meals.length > 0 && (
                <div className="meal-summary">
                    <div className="summary-totals">
                        <div className="total-row">
                            <span>Total:</span>
                            <span>{totalMacros.carbs}g carbs / {totalMacros.protein}g protein / {totalMacros.fat}g fat</span>
                            <span>{Math.round(totalCalories)} kcal</span>
                        </div>
                        <div className="goal-row">
                            <span>Goal:</span>
                            <span>{goalCarbs}g carbs / {goalProtein}g protein / {goalFat}g fat</span>
                            <span>{dailyCalories} kcal</span>
                        </div>
                        <div className="remaining-row">
                            <span>Remaining:</span>
                            <span>{goalCarbs - totalMacros.carbs}g carbs / {goalProtein - totalMacros.protein}g protein / {goalFat - totalMacros.fat}g fat</span>
                            <span className={remainingCalories < 0 ? 'over-goal' : 'under-goal'}>
                                {remainingCalories > 0 ? '+' : ''}{Math.round(remainingCalories)} kcal
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MealPlanning;
export type { Meal };
