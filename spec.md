# Smart IoT Access Control — To-Do Credit System & Futuristic UI

## Current State
The To-Do list has a GamificationPanel showing points, streak, and badges from the backend UserStats. Task cards are functional but visually minimal. The UserStats.points field already tracks points in the backend.

## Requested Changes (Diff)

### Add
- Prominent Credit Wallet header bar in the To-Do page showing current credits (from stats.points), animated on change
- Credits earned toast/floating number animation when a task is completed (+30 High, +20 Medium, +10 Low)
- Credit badge on each task card showing how many credits it will award
- Futuristic neon cyberpunk visual overhaul for the entire ToDoList page and all todo sub-components
- Credit level system (Rookie <100, Operator 100-499, Agent 500-999, Elite 1000+)

### Modify
- GamificationPanel: redesign as futuristic HUD with neon glows, credit coin icon, level tiers
- TaskStatsPanel: redesign with neon-styled metric cards and glowing chart bars
- TaskCard: add credit reward badge, neon priority glow, futuristic typography
- ToDoList page: neon header with credit wallet display, cyberpunk aesthetic

### Remove
- Nothing removed

## Implementation Plan
1. Create CreditWallet component showing animated credit balance with level tier
2. Redesign GamificationPanel as futuristic HUD panel with level system
3. Redesign TaskCard with neon glow borders by priority, credit reward chip
4. Redesign TaskStatsPanel with neon styling
5. Update ToDoList page layout with credit wallet in header, cyberpunk background pattern
