import { type MacroRatios } from './constants';
import { calculateTotalCalories, calculateGoalMacros } from './utils';

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
    currentMacros: MacroRatios;
}

interface MacroBarProps {
    label: string;
    current: number;
    goal: number;
    unit: string;
    colorClass: string;
}

function MacroBar({ label, current, goal, unit, colorClass }: MacroBarProps) {
    const percentage = Math.min((current / goal) * 100, 100);
    const overflowPercentage =
        current > goal ? Math.min(((current - goal) / goal) * 100, 100) : 0;
    const percentDV = Math.round((current / goal) * 100);

    return (
        <div className="macro-chart">
            <div className="macro-chart-header">
                <span className="macro-label">{label}</span>
                <span className="macro-values">
                    {Math.round(current)}
                    {unit} / {Math.round(goal)}
                    {unit} ({percentDV}% DV)
                </span>
            </div>
            <div className="progress-bar">
                <div
                    className={`progress-fill ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                ></div>
                {current > goal && (
                    <div
                        className="progress-overflow"
                        style={{ width: `${overflowPercentage}%` }}
                    ></div>
                )}
            </div>
        </div>
    );
}

function MealPlanning({
    meals,
    setMeals,
    dailyCalories,
    currentMacros,
}: MealPlanningProps) {
    const addMeal = () => {
        const newMeal: Meal = {
            id: Date.now(),
            name: `Meal ${meals.length + 1}`,
            carbs: 0,
            protein: 0,
            fat: 0,
        };
        setMeals([...meals, newMeal]);
    };

    const updateMeal = (
        id: number,
        field: keyof Omit<Meal, 'id'>,
        value: string | number
    ) => {
        setMeals(
            meals.map((meal) =>
                meal.id === id ? { ...meal, [field]: value } : meal
            )
        );
    };

    const deleteMeal = (id: number) => {
        setMeals(meals.filter((meal) => meal.id !== id));
    };

    const totalMacros = meals.reduce(
        (total, meal) => ({
            carbs: total.carbs + meal.carbs,
            protein: total.protein + meal.protein,
            fat: total.fat + meal.fat,
        }),
        { carbs: 0, protein: 0, fat: 0 }
    );

    const totalCalories = calculateTotalCalories(totalMacros);
    const remainingCalories = dailyCalories - totalCalories;

    const goalMacros = calculateGoalMacros(dailyCalories, currentMacros);

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
                    {meals.map((meal) => (
                        <div key={meal.id} className="meal-row">
                            <input
                                type="text"
                                value={meal.name}
                                onChange={(e) =>
                                    updateMeal(meal.id, 'name', e.target.value)
                                }
                                className="meal-name-input"
                                placeholder="Meal name"
                            />
                            <div className="meal-macros">
                                <div className="macro-input">
                                    <label>Carbs</label>
                                    <input
                                        type="number"
                                        value={meal.carbs || ''}
                                        onChange={(e) =>
                                            updateMeal(
                                                meal.id,
                                                'carbs',
                                                Number(e.target.value) || 0
                                            )
                                        }
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
                                        onChange={(e) =>
                                            updateMeal(
                                                meal.id,
                                                'protein',
                                                Number(e.target.value) || 0
                                            )
                                        }
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
                                        onChange={(e) =>
                                            updateMeal(
                                                meal.id,
                                                'fat',
                                                Number(e.target.value) || 0
                                            )
                                        }
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
                    <div className="summary-charts">
                        <MacroBar
                            label="Carbs"
                            current={totalMacros.carbs}
                            goal={goalMacros.carbs}
                            unit="g"
                            colorClass="carbs-fill"
                        />
                        <MacroBar
                            label="Protein"
                            current={totalMacros.protein}
                            goal={goalMacros.protein}
                            unit="g"
                            colorClass="protein-fill"
                        />
                        <MacroBar
                            label="Fat"
                            current={totalMacros.fat}
                            goal={goalMacros.fat}
                            unit="g"
                            colorClass="fat-fill"
                        />
                        <MacroBar
                            label="Calories"
                            current={totalCalories}
                            goal={dailyCalories}
                            unit=" kcal"
                            colorClass="calories-fill"
                        />
                    </div>

                    <div className="summary-totals">
                        <div className="remaining-row">
                            <span className="remaining-row-label">
                                Remaining:
                            </span>
                            <span>
                                <span className="carbs-remaining">
                                    {goalMacros.carbs - totalMacros.carbs}g
                                    carbs
                                </span>{' '}
                                /
                                <span className="protein-remaining">
                                    {' '}
                                    {goalMacros.protein - totalMacros.protein}g
                                    protein
                                </span>{' '}
                                /
                                <span className="fat-remaining">
                                    {' '}
                                    {goalMacros.fat - totalMacros.fat}g fat
                                </span>
                            </span>
                            <span className="calories-remaining">
                                {remainingCalories > 0 ? '+' : ''}
                                {Math.round(remainingCalories)} kcal
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
