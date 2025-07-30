# macronutrients

Plan and track daily nutrition

## design

### Overall goal:

Assist users in making nutritional goals, meal plans, and grocery lists.

### Stretch goals:

- Help them use raw ingredients and leftovers while they are still good.
- Select meals and snacks in terms of how much time it will take to prepare.

### Basic usage:

A user sets genreal macronutrient goals.

- percentages of protein, fat, and carbs add up to 100%
- calorie goals

A user plans meals and snacks for a given day.

- there's a way to mark which have been consumed and which are planned
- a simple dashboard indicates how their daily intake so far aligns with their goals, as well as their plan

A user specifies the nuturitional content of meals and snacks

- can be vague by specifying grams of macronutrients
- can include arbitrary notes

Intermediate usage:

- A user identifies meals in terms of ingredients.
- Nutritional information can include more detailed breakdowns to include fiber, trans/saturated fat, etc.
- Goals for these kinds of things can be set.

Advanced usage:

- Expiration dates can be added.
- Recipes can be stored and include data about how long it's good for.
- A "pantry" and "refrigerator" are added for the user to track what they've got and how long it is good for.

## architecture

A frontend-only react app deployed to gh pages.
Uses browser local storage for persistence.

## misc notes

### meal data structures

- a "food" is named, and has nutritional info per serving (and info on what a serving is)
    - food can have tags like vegan, vegetarian, nut-free, gluten-free
- a "meal" is a collection of foods and how many servings of each. a meal serves 1 and is consumed in one sitting
- a "day" is a collection of meals, conceptually spread across 24 hours
- a "group meal" is a collection of meals, conceptually spread across people who will have a meal together, simultaneously

- a "recipe book" contains 1+ "recipe"s
- a "recipe"
    - specifies specific quantities of "food"s as ingredients
    - yields some number of "servings" of a "food"
    - calculates the nutrition info of the yielded food serving based on the ingredients used

### macros to calories

- carbs: 4 kcal/g
- protein: 4kcal/g
- fat: 9 kcal/g

### commands ran

```bash
npx create-vite@latest . --template react-ts
cp README.md README-vite.md
# manually ctrl+z to get this README back
npm install
npm run dev
```
