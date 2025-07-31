import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { calculateTotalCalories } from './utils';
import './MealPlanning.css';
import './shared.css';

export interface Food {
    id: number;
    name: string;
    carbsPer100g: number;
    proteinPer100g: number;
    fatPer100g: number;
    servingSize: number; // in grams
}

interface FoodFormData {
    name: string;
    carbsPer100g: string;
    proteinPer100g: string;
    fatPer100g: string;
    servingSize: string;
}

interface MealPlanningProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

function MealPlanning({ isCollapsed, setIsCollapsed }: MealPlanningProps) {
    const [foods, setFoods] = useLocalStorage<Food[]>('foods', []);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState<FoodFormData>({
        name: '',
        carbsPer100g: '',
        proteinPer100g: '',
        fatPer100g: '',
        servingSize: '100',
    });

    const addFood = () => {
        if (!formData.name.trim()) return;

        const newFood: Food = {
            id: Date.now(),
            name: formData.name.trim(),
            carbsPer100g: parseFloat(formData.carbsPer100g) || 0,
            proteinPer100g: parseFloat(formData.proteinPer100g) || 0,
            fatPer100g: parseFloat(formData.fatPer100g) || 0,
            servingSize: parseFloat(formData.servingSize) || 100,
        };

        setFoods([...foods, newFood]);
        setFormData({
            name: '',
            carbsPer100g: '',
            proteinPer100g: '',
            fatPer100g: '',
            servingSize: '100',
        });
        setShowAddForm(false);
    };

    const deleteFood = (id: number) => {
        setFoods(foods.filter((food) => food.id !== id));
    };

    const updateFood = (
        id: number,
        field: keyof Food,
        value: string | number
    ) => {
        setFoods(
            foods.map((food) =>
                food.id === id ? { ...food, [field]: value } : food
            )
        );
    };

    const calculateFoodMacros = (food: Food) => {
        const multiplier = food.servingSize / 100;
        return {
            carbs: food.carbsPer100g * multiplier,
            protein: food.proteinPer100g * multiplier,
            fat: food.fatPer100g * multiplier,
        };
    };

    const calculateFoodCalories = (food: Food) => {
        const macros = calculateFoodMacros(food);
        return calculateTotalCalories(macros);
    };

    const handleFormChange = (field: keyof FoodFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const cancelForm = () => {
        setFormData({
            name: '',
            carbsPer100g: '',
            proteinPer100g: '',
            fatPer100g: '',
            servingSize: '100',
        });
        setShowAddForm(false);
    };

    return (
        <div className="meal-planning">
            <div className="section-header">
                <h2>
                    <button
                        className="collapse-button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        aria-label={
                            isCollapsed
                                ? 'Expand meal planning section'
                                : 'Collapse meal planning section'
                        }
                    >
                        {isCollapsed ? '▶' : '▼'}
                    </button>
                    Meal Planning
                </h2>
                {!isCollapsed && (
                    <button
                        className="add-button"
                        onClick={() => setShowAddForm(true)}
                        disabled={showAddForm}
                    >
                        + Add Food
                    </button>
                )}
            </div>

            {isCollapsed && foods.length > 0 && (
                <div className="collapsed-summary">
                    <span className="summary-text">
                        {foods.length} food{foods.length !== 1 ? 's' : ''}{' '}
                        defined
                    </span>
                </div>
            )}

            {!isCollapsed && (
                <div className="meal-planning-content">
                    {showAddForm && (
                        <div className="food-form">
                            <h3>Add New Food</h3>
                            <div className="form-row">
                                <label>
                                    Food Name:
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) =>
                                            handleFormChange(
                                                'name',
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g., Chicken Breast"
                                        autoFocus
                                    />
                                </label>
                            </div>

                            <div className="macros-per-100g">
                                <h4>Macros per 100g:</h4>
                                <div className="form-row macros-row">
                                    <label className="carbs-text">
                                        Carbs (g):
                                        <input
                                            type="number"
                                            value={formData.carbsPer100g}
                                            onChange={(e) =>
                                                handleFormChange(
                                                    'carbsPer100g',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="0"
                                            min="0"
                                            step="0.1"
                                        />
                                    </label>
                                    <label className="protein-text">
                                        Protein (g):
                                        <input
                                            type="number"
                                            value={formData.proteinPer100g}
                                            onChange={(e) =>
                                                handleFormChange(
                                                    'proteinPer100g',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="0"
                                            min="0"
                                            step="0.1"
                                        />
                                    </label>
                                    <label className="fat-text">
                                        Fat (g):
                                        <input
                                            type="number"
                                            value={formData.fatPer100g}
                                            onChange={(e) =>
                                                handleFormChange(
                                                    'fatPer100g',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="0"
                                            min="0"
                                            step="0.1"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="form-row">
                                <label>
                                    Default Serving Size (g):
                                    <input
                                        type="number"
                                        value={formData.servingSize}
                                        onChange={(e) =>
                                            handleFormChange(
                                                'servingSize',
                                                e.target.value
                                            )
                                        }
                                        placeholder="100"
                                        min="1"
                                        step="1"
                                    />
                                </label>
                            </div>

                            <div className="form-buttons">
                                <button
                                    className="save-button"
                                    onClick={addFood}
                                >
                                    Save Food
                                </button>
                                <button
                                    className="cancel-button"
                                    onClick={cancelForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {foods.length === 0 && !showAddForm && (
                        <div className="empty-state">
                            <p>No foods defined yet.</p>
                            <p>
                                Add foods to build your meal planning library.
                            </p>
                        </div>
                    )}

                    {foods.length > 0 && (
                        <div className="foods-list">
                            <h3>Your Foods Library</h3>
                            {foods.map((food) => {
                                const macros = calculateFoodMacros(food);
                                const calories = calculateFoodCalories(food);

                                return (
                                    <div key={food.id} className="food-item">
                                        <div className="food-header">
                                            <input
                                                type="text"
                                                value={food.name}
                                                onChange={(e) =>
                                                    updateFood(
                                                        food.id,
                                                        'name',
                                                        e.target.value
                                                    )
                                                }
                                                className="food-name-input"
                                            />
                                            <button
                                                className="delete-button"
                                                onClick={() =>
                                                    deleteFood(food.id)
                                                }
                                                aria-label={`Delete ${food.name}`}
                                            >
                                                🗑
                                            </button>
                                        </div>

                                        <div className="food-serving">
                                            <label>
                                                Serving Size:
                                                <input
                                                    type="number"
                                                    value={food.servingSize}
                                                    onChange={(e) =>
                                                        updateFood(
                                                            food.id,
                                                            'servingSize',
                                                            parseFloat(
                                                                e.target.value
                                                            ) || 100
                                                        )
                                                    }
                                                    min="1"
                                                    step="1"
                                                />
                                                g
                                            </label>
                                        </div>

                                        <div className="food-macros">
                                            <div className="macros-per-100g-display">
                                                <strong>Per 100g:</strong>
                                                <div className="macro-inputs">
                                                    <label className="carbs-text">
                                                        C:
                                                        <input
                                                            type="number"
                                                            value={
                                                                food.carbsPer100g
                                                            }
                                                            onChange={(e) =>
                                                                updateFood(
                                                                    food.id,
                                                                    'carbsPer100g',
                                                                    parseFloat(
                                                                        e.target
                                                                            .value
                                                                    ) || 0
                                                                )
                                                            }
                                                            min="0"
                                                            step="0.1"
                                                        />
                                                        g
                                                    </label>
                                                    <label className="protein-text">
                                                        P:
                                                        <input
                                                            type="number"
                                                            value={
                                                                food.proteinPer100g
                                                            }
                                                            onChange={(e) =>
                                                                updateFood(
                                                                    food.id,
                                                                    'proteinPer100g',
                                                                    parseFloat(
                                                                        e.target
                                                                            .value
                                                                    ) || 0
                                                                )
                                                            }
                                                            min="0"
                                                            step="0.1"
                                                        />
                                                        g
                                                    </label>
                                                    <label className="fat-text">
                                                        F:
                                                        <input
                                                            type="number"
                                                            value={
                                                                food.fatPer100g
                                                            }
                                                            onChange={(e) =>
                                                                updateFood(
                                                                    food.id,
                                                                    'fatPer100g',
                                                                    parseFloat(
                                                                        e.target
                                                                            .value
                                                                    ) || 0
                                                                )
                                                            }
                                                            min="0"
                                                            step="0.1"
                                                        />
                                                        g
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="serving-nutrition">
                                                <strong>
                                                    Per serving (
                                                    {food.servingSize}g):
                                                </strong>
                                                <div className="nutrition-display">
                                                    <span className="carbs-text">
                                                        {macros.carbs.toFixed(
                                                            1
                                                        )}
                                                        g carbs
                                                    </span>
                                                    <span className="protein-text">
                                                        {macros.protein.toFixed(
                                                            1
                                                        )}
                                                        g protein
                                                    </span>
                                                    <span className="fat-text">
                                                        {macros.fat.toFixed(1)}g
                                                        fat
                                                    </span>
                                                    <span className="calories-text">
                                                        {Math.round(calories)}{' '}
                                                        cal
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MealPlanning;
