import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { calculateTotalCalories } from './utils';
import './MealPlanning.css';
import './shared.css';

export interface Food {
    id: number;
    name: string;
    servingSize: number;
    servingUnit: string;
    carbsPerServing: number;
    proteinPerServing: number;
    fatPerServing: number;
}

interface FoodFormData {
    name: string;
    servingSize: string;
    servingUnit: string;
    carbsPerServing: string;
    proteinPerServing: string;
    fatPerServing: string;
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
        servingSize: '1',
        servingUnit: 'cup',
        carbsPerServing: '',
        proteinPerServing: '',
        fatPerServing: '',
    });

    const addFood = () => {
        if (!formData.name.trim()) return;

        const newFood: Food = {
            id: Date.now(),
            name: formData.name.trim(),
            servingSize: parseFloat(formData.servingSize) || 1,
            servingUnit: formData.servingUnit.trim() || 'serving',
            carbsPerServing: parseFloat(formData.carbsPerServing) || 0,
            proteinPerServing: parseFloat(formData.proteinPerServing) || 0,
            fatPerServing: parseFloat(formData.fatPerServing) || 0,
        };

        setFoods([...foods, newFood]);
        setFormData({
            name: '',
            servingSize: '1',
            servingUnit: 'cup',
            carbsPerServing: '',
            proteinPerServing: '',
            fatPerServing: '',
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
        // Since we now store macros per serving, we just return them directly
        return {
            carbs: food.carbsPerServing,
            protein: food.proteinPerServing,
            fat: food.fatPerServing,
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
            servingSize: '1',
            servingUnit: 'cup',
            carbsPerServing: '',
            proteinPerServing: '',
            fatPerServing: '',
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

                            <div className="form-row serving-size-row">
                                <label>
                                    Serving Size:
                                    <input
                                        type="number"
                                        value={formData.servingSize}
                                        onChange={(e) =>
                                            handleFormChange(
                                                'servingSize',
                                                e.target.value
                                            )
                                        }
                                        placeholder="1"
                                        min="0.1"
                                        step="0.1"
                                    />
                                </label>
                                <label>
                                    Unit:
                                    <select
                                        value={formData.servingUnit}
                                        onChange={(e) =>
                                            handleFormChange(
                                                'servingUnit',
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="cup">cup</option>
                                        <option value="tbsp">tbsp</option>
                                        <option value="tsp">tsp</option>
                                        <option value="oz">oz</option>
                                        <option value="g">g</option>
                                        <option value="lb">lb</option>
                                        <option value="piece">piece</option>
                                        <option value="slice">slice</option>
                                        <option value="serving">serving</option>
                                    </select>
                                </label>
                            </div>

                            <div className="macros-per-serving">
                                <h4>
                                    Macros per serving ({formData.servingSize}{' '}
                                    {formData.servingUnit}):
                                </h4>
                                <div className="form-row macros-row">
                                    <label className="carbs-text">
                                        Carbs (g):
                                        <input
                                            type="number"
                                            value={formData.carbsPerServing}
                                            onChange={(e) =>
                                                handleFormChange(
                                                    'carbsPerServing',
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
                                            value={formData.proteinPerServing}
                                            onChange={(e) =>
                                                handleFormChange(
                                                    'proteinPerServing',
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
                                            value={formData.fatPerServing}
                                            onChange={(e) =>
                                                handleFormChange(
                                                    'fatPerServing',
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
                                                            ) || 1
                                                        )
                                                    }
                                                    min="0.1"
                                                    step="0.1"
                                                />
                                            </label>
                                            <label>
                                                Unit:
                                                <select
                                                    value={food.servingUnit}
                                                    onChange={(e) =>
                                                        updateFood(
                                                            food.id,
                                                            'servingUnit',
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="cup">
                                                        cup
                                                    </option>
                                                    <option value="tbsp">
                                                        tbsp
                                                    </option>
                                                    <option value="tsp">
                                                        tsp
                                                    </option>
                                                    <option value="oz">
                                                        oz
                                                    </option>
                                                    <option value="g">g</option>
                                                    <option value="lb">
                                                        lb
                                                    </option>
                                                    <option value="piece">
                                                        piece
                                                    </option>
                                                    <option value="slice">
                                                        slice
                                                    </option>
                                                    <option value="serving">
                                                        serving
                                                    </option>
                                                </select>
                                            </label>
                                        </div>

                                        <div className="food-macros">
                                            <div className="macros-per-serving-display">
                                                <strong>
                                                    Per serving (
                                                    {food.servingSize}{' '}
                                                    {food.servingUnit}):
                                                </strong>
                                                <div className="macro-inputs">
                                                    <label className="carbs-text">
                                                        C:
                                                        <input
                                                            type="number"
                                                            value={
                                                                food.carbsPerServing
                                                            }
                                                            onChange={(e) =>
                                                                updateFood(
                                                                    food.id,
                                                                    'carbsPerServing',
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
                                                                food.proteinPerServing
                                                            }
                                                            onChange={(e) =>
                                                                updateFood(
                                                                    food.id,
                                                                    'proteinPerServing',
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
                                                                food.fatPerServing
                                                            }
                                                            onChange={(e) =>
                                                                updateFood(
                                                                    food.id,
                                                                    'fatPerServing',
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

                                            <div className="nutrition-summary">
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
