# Macronutrients Tracker - AI Coding Agent Instructions

## Project Overview

A React TypeScript nutrition tracking app deployed to GitHub Pages. Frontend-only with localStorage persistence for simplicity and offline capability. Focuses on daily macro goal setting and meal tracking with visual progress feedback.

## Core Architecture Principles

### State Management Philosophy

- **localStorage-first**: All app state persists in browser storage via custom `useLocalStorage` hook
- **Type-safe serialization**: Hook handles automatic JSON serialization with type inference
- **Graceful degradation**: Always provide fallback defaults for corrupted/missing data
- **Validation at boundaries**: Sanitize localStorage data on load (especially user-generated content)

### Component Architecture

- **Colocation**: Each major component includes its own .tsx/.css files
- **State lifting**: App.tsx coordinates all state, components are primarily presentational
- **Controlled inputs**: All form inputs are controlled via React state
- **Collapsible UI**: Major sections can collapse to summary views for better UX

### Data Flow Patterns

- **Constants-first**: All business logic constants (nutrition ratios, calorie conversions) centralized
- **Pure calculation functions**: Math operations isolated in `utils.ts` for testability
- **Derived state**: Compute dependent values (like fat percentage) rather than storing them

## Testing Strategy

### Test Architecture

- **Vitest + Testing Library**: Standard modern React testing setup
- **Mock localStorage**: Every test file mocks localStorage with `vi.stubGlobal()`
- **User-centric tests**: Test user interactions rather than implementation details
- **Integration focus**: Verify localStorage save/load cycles and component communication

### Test Patterns to Follow

```typescript
// Always set up user events
const user = userEvent.setup();
await user.click(button);

// Mock validation pattern
expect(mockFn).toHaveBeenCalledWith(expectedValue);

// Edge case coverage
// Test zero values, negative inputs, localStorage errors
```

## Domain Knowledge

### Nutrition Calculations

- **Calorie conversion**: Uses FDA standard (carbs/protein: 4 kcal/g, fat: 9 kcal/g)
- **Macro ratios**: Stored as decimals (0.45 = 45%), converted for display
- **Constraint logic**: Custom macros must sum to ≤100%, fat is calculated remainder

### Progress Visualization

- **Visual caps**: Progress bars max at 100% width but show overflow data in labels
- **Overflow indication**: Additional visual elements when goals are exceeded
- **Real-time updates**: Progress recalculates immediately on input changes

## Development Patterns

### File Organization

- `src/constants.ts` - All business constants and types
- `src/utils.ts` - Pure calculation functions
- `src/hooks/` - Custom React hooks
- `tests/` - Mirror src structure, comprehensive coverage

### Build & Deploy

- GitHub Pages deployment via `npm run deploy`
- Vite build system with TypeScript checking
- Base path configured for GitHub Pages subdirectory

## Key Principles to Maintain

- **Offline-first**: App should work without network connectivity
- **Data integrity**: Always validate user inputs and localStorage data
- **Progressive enhancement**: Core functionality works, then add convenience features
- **Type safety**: Leverage TypeScript for better developer experience
- **Testability**: Write code that's easy to test in isolation
